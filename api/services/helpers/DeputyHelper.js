let latinize = require('latinize')

module.exports = {
    getDeputyIdForVoteInBallot: function(deputies, vote) {
        let iterDeputy;
        let deputyId;

        let voteFirstname = latinize(vote.deputy.firstname).replace(' ', '-');
        let voteLastname = latinize(vote.deputy.lastname).replace(' ', '-');

        for (let i in deputies) {
            iterDeputy = deputies[i];
            let lastnameMatch = false;
            let firstnameMatch = false;

            let iterFirstname = latinize(iterDeputy.firstname).replace(' ', '-');
            let iterLastname = latinize(iterDeputy.lastname).replace(' ', '-');

            if (iterFirstname == voteFirstname) {
                firstnameMatch = true;
            }
            if (iterLastname == voteLastname) {
                lastnameMatch = true;
            }
            if (lastnameMatch && firstnameMatch) {
                deputyId = iterDeputy.officialId;
                break;
            }
        }
        return deputyId;
    }
}
