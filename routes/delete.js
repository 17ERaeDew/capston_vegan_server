module.exports = function(app, Exam) {
    app.delete('/delete/:id', function(req, res){
        Exam.remove({ _id: req.params.id }, function(err){
            if(err) return res.status(500).json({ error: 'Internal Server Error - Database (500)' });
        })
    });
}