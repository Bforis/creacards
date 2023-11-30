import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

import { planAPIs } from '../../api';

import './subscription.css';

function Subscription() {

    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState([]);

    //Book Plan
    const bookPlan = async (planId) => {
        try {
            if (loading) return;
            setLoading(true);
            const token = window.localStorage.getItem("token");
            const stripe = await loadStripe("pk_test_51KlwoWBDN9MiNxsbE8UZShxLapEQvAT9aq4jAyCIZ81KYGmFxtEikoDin8u0cQ4tD6zpGcIxhOc2X4V3um5PioAj00d7XJqdpq");
            const response = await fetch(planAPIs.checkoutPlan(planId), { methods: "GET", headers: { token } });
            const res = await response.json();
            console.log(res);
            if (res.status !== "success") throw res;
            console.log({
                sessionId: res.data.session.id
            })
            stripe.redirectToCheckout({
                sessionId: res.data.session.id
            });
        } catch (err) {
            alert(err.message);
        }
        setLoading(false);
    }

    const fetchPlans = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const token = window.localStorage.getItem("token");
            const response = await fetch(planAPIs.fetchPlans, { methods: "GET", headers: { token } });
            const res = await response.json();
            if (res.status !== "success") throw res;
            setPlans(res.data.plans);
        } catch (err) {
            console.log(err.message);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchPlans()
    });

    return <div className='subscriptions'>
        {
            plans.map((plan, index) => {
                return <div key={index} className='subscription'>
                    <h3>{plan.title}</h3>
                    <ul>
                        <li>{plan.days} Days</li>
                        <li>{plan.amount} USD</li>
                    </ul>
                    <button onClick={() => bookPlan(plan._id)}>Buy</button>
                </div>
            })
        }
    </div >
}

export default Subscription;