// code building functions
CodeBuilder = {
    // I don't think I need an init function. Will call functions on this from the ChartBuilder object
    packageCode : function() {
        // this function will package up all the code and out put it
        /*
        $.ajax('buildChart.php', {
            data : "someData",
            dataType : "json",
            success : function(data) {
                console.log(data);
            },
            error : function(data) {
                console.log(data);
            }
        });
        */
        // just for debugging I am going to the page so I can see what is happening
        $("#chart-settings").attr("method", "post");
        $("#chart-settings").attr("action", "buildChart.php");
        $("#chart-settings").submit();
    }
};