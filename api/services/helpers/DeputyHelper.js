var self = module.exports = {
  getDeputyIdForVoteInBallot: function(deputies, vote) {
    var iterDeputy;
    var deputyId;
    for (i in deputies) {
      iterDeputy = deputies[i]
      var lastnameMatch = false;
      var firstnameMatch = false;
      if (iterDeputy.lastname === vote.depute.lastname) {
        lastnameMatch = true;
        console.log("found same lastname : " + vote.depute.lastname);
      }
      if (iterDeputy.firstname === vote.depute.firstname) {
        firstnameMatch = true;
        console.log("found same firstname : " + vote.depute.firstname);
      }
      if (lastnameMatch || firstnameMatch && (!(lastnameMatch && firstnameMatch))) {
        console.log("found almost same name for  " + vote.depute.firstname + " " + vote.depute.lastname + " / " + iterDeputy.firstname + " " + iterDeputy.lastname);
      }
      if (lastnameMatch && firstnameMatch) {
        deputyId = iterDeputy.id;
        break;
      }
    }
    if (deputyId) {
      console.log("found " + deputyId + " for vote " + vote.depute.firstname + " " + vote.depute.lastname)
    } else {
      // console.log("found no deputyId for vote " + vote.depute.firstname + " " + vote.depute.lastname)
    }
    return deputyId;
  }
}
