module.exports = function(app, Exam) {

    app.put('/update/:id', function(req, res){

        // FIND & UPDATE
        Exam.findById(req.params.id, function(err, exam) {

            if(err) return res.status(500).json({ error: 'Internal Server Error - Database (500)' });
            if(!exam) return res.status(404).json({ error: 'Not Found (404)' });

            // 값을 변경 후 exam에 저장
            if(req.body.stringA) exam.stringA = req.body.stringA;
            if(req.body.stringB) exam.stringB = req.body.stringB;


            // exam 저장
            exam.save(function (err) {
                if(err) res.status(500).json({error: 'Update Fail'});
                res.json({message: 'Update Complete'});
            });
        });

    });
}