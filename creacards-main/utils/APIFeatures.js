class APIFeatures {

    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        let queryObj = { ...this.queryString };
        ["sort", "page", "limit", "fields", "export"].forEach((prop) => delete queryObj[prop]);
        let queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt|regex|options|or|and|in)\b/g, (match) => `$${match}`);

        queryObj = JSON.parse(queryStr);
        ['$or', '$and'].forEach(oper => {
            const query = [];
            if (queryObj[oper]) {
                for (let prop in queryObj[oper]) {
                    query.push({ [prop]: queryObj[oper][prop] });
                }
                queryObj[oper] = query;
            }
        })
        this.query = this.query.find(queryObj);
        return this;
    }

    sort() {

        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("-createdAt -signUpDate -visitOn");
        }
        return this;

    }

    limitFields(restrictedFields) {

        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select(restrictedFields);
        }
        return this;

    }

    limitFieldsv2(select) {
        if (this.queryString.fields) {
            const newQuery = {}
            const splitFields = this.queryString.fields.split(',');
            splitFields.forEach(field => {
                newQuery[field] = 1
            })
            this.queryString.fields = { ...newQuery, ...select }
            this.query.select(this.queryString.fields)

        } else {
            this.queryString.fields = select
            this.query.select(this.queryString.fields)

        }
        return this;
    }

    paginate() {
        if (this.queryString.export) return this;
        //if (this.queryString.page || this.queryString.limit) {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 15;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        //}
        return this;

    }

    /*check empty object*/
    isObjectEmpty(obj) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    removeNullFields() {
        const query = this.queryString;
        //remove undefined and null properties from query 
        for (let field in query) {
            /*remove null from nested object*/
            if (typeof query[field] === "object") {
                for (let innerField in query[field]) {
                    if (["undefined", undefined, "null", null].includes(query[field][innerField]))
                        delete query[field][innerField];
                }
                //remove the object if it is empty
                if (this.isObjectEmpty(query[field])) delete query[field];
                /*remove null from nested object*/
            } else {
                if (["undefined", undefined, "null", null].includes(query[field]))
                    delete query[field];
            }
        }
        return this;
    }
}

module.exports = APIFeatures;