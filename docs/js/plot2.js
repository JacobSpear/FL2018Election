function init(){
    let file_loc = `data/SH29_results.json`;
    d3.json(file_loc).then((data)=>{
        // plot1_summarize(data,district_id);
        plot2_newPlot(data);
    });

}



function plot2_newPlot(data){

    let latitude =  Object.values(data['Latitude']);
    let longitude = Object.values(data['Longitude']);
    let latMean = arrMean(latitude);
    let latStd = arrStd(latitude);
    let longMean = arrMean(longitude);
    let longStd = arrStd(longitude);
    let allVotes = Object.values(data['Vote Total']);
    let size_adj = allVotes.map(x=> x/200);
    let demPcts = Object.values(data['Percent Dem']);
    let dem_adj = [];
    
    for(i=0;i<demPcts.length;i++){
        p = demPcts[i];    
        dem_adj.push(0.5+Math.sign((p - 0.5))*(Math.abs(2*((p - 0.5)))**0.5)/2)
    }

    let precinctNames = Object.values(data['Precinct']);
    let textStrings = []
    for(i=0;i<precinctNames.length;i++){
        newString = `${precinctNames[i]}<br>Democratic Votes: ${Math.round(1000*demPcts[i])/10}%<br>Total Votes: ${allVotes[i]}`;
        textStrings.push(newString);
    }


    let trace = {
        x : latitude,
        y : longitude,
        hovertext : textStrings,
        hoverinfo : 'text',
        mode:'markers',
        type:'scatter',
        marker : {
            size : size_adj,
            color : dem_adj,
            cmin : 0,
            cmax : 1,
            colorscale : [[0, 'rgb(255,0,0)'], [1, 'rgb(0,0,255)']]
        }
    };

    let traceArray = [trace];

    let layout = {
        title : `State House District 29 Precincts and Results`,
        xaxis : {
            title:`Latitude`,
            range:[28.6,28.84]
        },
        yaxis : {
            title:`Longitude`,
            range:[-81.49,-81.26]
        },
        hovermode : 'closest',
        clickmode : 'select',
        hoverdistance : 1

    };

    Plotly.newPlot("plot2_plot",traceArray,layout);
}

// function plot1_summarize(data,district_id){
//     let district = district_id.split('SH')[1];

//     let demVotes = 0;
//     let repVotes = 0;
//     demVoteData = Object.values(data['Dem Vote %']);
//     repVoteData = Object.values(data['Repub Vote %']);
//     totalVoteData = Object.values(data['Total_Votes']);
//     turnoutData = Object.values(data['Turnout']);

//     for(i=0;i<demVoteData.length;i++){
//         demVotes = demVotes + demVoteData[i]/100*totalVoteData[i];
//         repVotes = repVotes + repVoteData[i]/100*totalVoteData[i];
//     }
    
    
//     let dem_pct = Math.round(demVotes/(demVotes+repVotes)*10000)/100;    
//     let rep_pct = Math.round(repVotes/(demVotes+repVotes)*10000)/100;    

//     pearson_r = pearsonR(demVoteData,turnoutData);

//     is_correlated = (Math.abs(pearson_r)>=0.7);

//     let plot1_text = `In the ${district}th district, of voters who supported either a democrat or a republican, ${dem_pct}% supported a democrat and ${rep_pct}% supported a republican.  We ${is_correlated ? 'did' : 'did not'} find a significant correlation between party affiliation and voter turnout by precinct.  The data have a correlation (pearson r) of ${pearson_r}. `

//     d3.select('#plot1_summary').text(plot1_text)
// }



init();