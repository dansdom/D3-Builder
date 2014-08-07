var D3Builder = D3Builder || {};
// function to create the chart code
D3Builder.codeBuilder = (function($, undefined) {
    'use strict';

    // code building functions
    var codeBuilder = {
        packageCode : function() {
            // this function will package up all the code and out put it
            //console.log(D3Builder.codeBuilder.settings);
            
            $.ajax("buildChart.php", {
                data : codeBuilder.settings,
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
        },
        settings : {
            // this is the settings object that will get passed to the php to make the chart files. This object is set in the showChart.js script
        }
    };

    return codeBuilder;
})(jQuery);