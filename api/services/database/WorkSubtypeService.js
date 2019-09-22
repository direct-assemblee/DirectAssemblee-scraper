var self = module.exports = {
    insertWorkSubtype: function(workSubtype) {
        return self.findWorkSubtype(workSubtype.name)
        .then(foundWorkSubtype => {
            if (!foundWorkSubtype) {
                return insertWorkSubtype(workSubtype);
            }
        })
        .catch(err => {
            console.log(err);
            return;
        })
    },

    findWorkSubtype: function(workSubtypeName) {
        if (workSubtypeName == undefined) {
            return Promise.reject("No work subtype name");
        } else {
            return WorkSubtype.findOne({
                name: workSubtypeName
            });
        }
    }
}

let insertWorkSubtype = function(workSubtype) {
    return WorkSubtype.create({
        name: workSubtype.name,
        parentTypeId: workSubtype.parentType
    })
}
