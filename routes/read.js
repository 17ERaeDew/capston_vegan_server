module.exports = function(app, Exam)
{
    app.get('/read', function(req,res){
        Exam.find(function(err, exams){
            if(err) return res.status(500).send({error: 'read fail'});
            res.json(exams);
        })
    });
}