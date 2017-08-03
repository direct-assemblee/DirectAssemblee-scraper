var moment = require('moment')

module.exports = {
    parseList: function(jsonContent) {
        var deputes = JSON.parse(jsonContent)
        var deputesList = deputes.deputes
        var deputesUrls = []
        for (var i in deputesList) {
            // print(deputesList[i].depute)
            deputesUrls.push(deputesList[i].depute.url_nosdeputes_api)
        }
        return Promise.all(deputesUrls)
    },

    parse: function(jsonContent) {
        return new Promise(function (resolve, reject) {
            var depute = JSON.parse(jsonContent)
            var deputeInfos = createDeputeInfosModel(depute.depute)
            return resolve(deputeInfos)
        })
    }
}

var createDeputeInfosModel = function(deputeInfos) {
    return Promise.resolve({
        'fullname': deputeInfos.nom,
        'lastname': deputeInfos.nom_de_famille,
        'firstname': deputeInfos.prenom,
        'genre': deputeInfos.sexe,
        'birthdate': deputeInfos.date_naissance,
        'birthplace': deputeInfos.lieu_naissance,
        'departmentNumber': deputeInfos.num_deptmt,
        'districtName': deputeInfos.nom_circo,
        'districtNumber': deputeInfos.num_circo,
        'mandateStartingDate': deputeInfos.mandat_debut,
        'roleInParty': deputeInfos.groupe,
        'partyShort': deputeInfos.groupe_sigle,
        'party': deputeInfos.parti_ratt_financier,
        'responsabilities': deputeInfos.responsabilites,
        'responsabilities_out_of_parliament': deputeInfos.responsabilites_extra_parlementaires,
        'parliament_groups': deputeInfos.groupes_parlementaires,
        'websites': deputeInfos.sites_web,
        'emails': deputeInfos.emails,
        'addresses': deputeInfos.adresses,
        'previousMandates': deputeInfos.anciens_mandats,
        'otherMandates': deputeInfos.autres_mandats,
        'previousOtherMandates': deputeInfos.anciens_autres_mandats,
        'job': deputeInfos.profession,
        'seat': deputeInfos.place_en_hemicycle,
        'officialUrl': deputeInfos.url_an,
        'officialId': deputeInfos.id_an,
        'slugName': deputeInfos.slug,
        'numberOfMandates': deputeInfos.nb_mandats,
        'twitter': deputeInfos.twitter
    })
}

var print = function(depute) {
    console.log('<<< ------------- ')
    console.log('id : ' + depute.id)
    console.log('nom : ' + depute.nom)
    console.log('nom_de_famille : ' + depute.nom_de_famille)
    console.log('prenom : ' + depute.prenom)
    console.log('sexe : ' + depute.sexe)
    console.log('date_naissance : ' + depute.date_naissance)
    console.log('lieu_naissance : ' + depute.lieu_naissance)
    console.log('num_deptmt : ' + depute.num_deptmt)
    console.log('nom_circo : ' + depute.nom_circo)
    console.log('num_circo : ' + depute.num_circo)
    console.log('mandat_debut : ' + depute.mandat_debut)
    console.log('groupe_sigle : ' + depute.groupe_sigle)
    console.log('parti_ratt_financier : ' + depute.parti_ratt_financier)
    console.log('sites_web : ' + depute.sites_web)
    console.log('emails : ' + depute.emails)
    console.log('adresses : ' + depute.adresses)
    console.log('anciens_mandats : ' + depute.anciens_mandats)
    console.log('autres_mandats : ' + depute.autres_mandats)
    console.log('anciens_autres_mandats : ' + depute.anciens_autres_mandats)
    console.log('profession : ' + depute.profession)
    console.log('place_en_hemicycle : ' + depute.place_en_hemicycle)
    console.log('url_an : ' + depute.url_an)
    console.log('id_an : ' + depute.id_an)
    console.log('slug : ' + depute.slug)
    console.log('url_nosdeputes : ' + depute.url_nosdeputes)
    console.log('url_nosdeputes_api : ' + depute.url_nosdeputes_api)
    console.log('nb_mandats : ' + depute.nb_mandats)
    console.log('twitter : ' + depute.twitter)
    console.log('------------- >>>')
}
