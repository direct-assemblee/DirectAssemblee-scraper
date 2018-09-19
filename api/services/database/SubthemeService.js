module.exports = {
    findSubthemes: function() {
        return Subtheme.find()
        .populate('theme');
    }
}
