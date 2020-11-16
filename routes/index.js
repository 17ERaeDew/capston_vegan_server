module.exports = function(app, Exam)
{
    app.post('/create', function(req, res){
        var exam = new Exam();
        exam.stringA = req.body.stringA;
        exam.stringB = req.body.stringB;

        console.log(req);

        exam.save(function(err){
            if(err){
                // fail
                console.error(err);
                res.json({result: 0});
                return;
            }
            // Success
            res.json({result: 1});
        });
    });
}