// code building functions
var CodeBuilder = {
    // I don't think I need an init function. Will call functions on this from the ChartBuilder object
    packageCode : function() {
        // this function will package up all the code and out put it
        console.log(CodeBuilder.settings);
        
        $.ajax("buildChart.php", {
            data : CodeBuilder.settings,
            dataType : "text",
            type : "POST",
            success : function(data) {
                // ideally this zip file should be served from the php script and not from here
                window.location.href = "/chart.zip";
                console.log(data);
            },
            error : function(data) {
                console.log(data);
            }
        });
        
        // just for debugging I am going to the page so I can see what is happening
        //console.log('packaging code');
        //$("#chart-settings").attr("method", "post");
        //$("#chart-settings").attr("action", "buildChart.php");
        //$("#chart-settings").submit();
        //window.location.href = '/chart.zip';
    },
    settings : {
        // this is the settings object that will get passed to the php to make the chart files. This object is set in the showChart.js script
    }
};