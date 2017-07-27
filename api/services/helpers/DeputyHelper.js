var latinize = require('latinize')

var self = module.exports = {
    getDeputyIdForVoteInBallot: function(deputies, vote) {
        var iterDeputy;
        var deputyId;
        for (i in deputies) {
            iterDeputy = deputies[i]
            var lastnameMatch = false;
            var firstnameMatch = false;

            var iterFirstname = latinize(iterDeputy.firstname).replace(' ', '-')
            var iterLastname = latinize(iterDeputy.lastname).replace(' ', '-')
            var voteFirstname = latinize(vote.deputy.firstname).replace(' ', '-')
            var voteLastname = latinize(vote.deputy.lastname).replace(' ', '-')

            if (iterFirstname == voteFirstname) {
                firstnameMatch = true;
                // console.log("found same lastname : " + voteLastname);
            }
            if (iterLastname == voteLastname) {
                lastnameMatch = true;
                // console.log("found same firstname : " + voteFirstname);
            }
            if ((lastnameMatch || firstnameMatch) && (!(lastnameMatch && firstnameMatch))) {
                // console.log("found almost same name for  " +  "." + voteFirstname + "." + voteLastname + "." + "/" + iterFirstname + "." + iterLastname + ".");
            }
            if (lastnameMatch && firstnameMatch) {
                deputyId = iterDeputy.id;
                break;
            }
        }
        if (deputyId) {
            // console.log("found id " + deputyId + " for vote " + vote.depute.firstname + " " + vote.depute.lastname)
        } else {
            // console.log("found no deputyId for vote " + vote.depute.firstname + " " + vote.depute.lastname)
        }
        return deputyId;
    }
}
