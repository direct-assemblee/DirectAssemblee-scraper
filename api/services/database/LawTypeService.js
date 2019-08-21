var self = module.exports = {
    insertLawType: function(lawTypeName) {
        return self.findLawType(lawTypeName)
        .then(foundLawType => {
            if (!foundLawType) {
                return insertLawType(lawTypeName);
            }
        })
        .catch(err => {
            console.log(err);
            return;
        })
    },

    findLawType: function(lawTypeName) {
        if (lawTypeName == undefined) {
            return Promise.reject("No law type");
        } else {
            return LawType.findOne({
                name: lawTypeName
            });
        }
    }
}

let insertLawType = function(lawTypeName) {
    return LawType.create({ name: lawTypeName })
}
