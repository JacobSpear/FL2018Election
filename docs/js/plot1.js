let district_lookup = {'SH27':'SH_District_27.json',
                    'SH28':'SH_District_28.json',
                    'SH29':'SH_District_29.json',
                    'SH30':'SH_District_30.json'
}

function init(){
    let district_id = d3.select("#plot1_selDistrict").property('value');
    let district_file = district_lookup[district_id];
    let district_loc = `../data/${district_file}`;
    d3.json(district_loc).then((data)=>{
        plot1_summarize(data,district_id);
        plot1_newPlot(data,district_id);
    });

}

function plot1_fetchData(){
    let district_id = d3.select("#plot1_selDistrict").property('value');
    let district_file = district_lookup[district_id];
    let district_loc = `../data/${district_file}`;
    d3.json(district_loc).then((data)=>{
        plot1_summarize(data,district_id);
        plot1_updatePlot(data,district_id);
    });
}


function plot1_newPlot(data,district_id){
    let district = district_id.split('SH')[1];
 

    let trace = {
        x : Object.values(data['Dem Vote %']),
        y : Object.values(data['Turnout']),
        mode:'markers',
        type:'scatter'
    };

    let traceArray = [trace];

    let layout = {
        title : `Voter Turnout vs. Results by Party (Democrats) <br> in State House District ${district}`,
        xaxis : {
            title:`Percent Democrat`
        },
        yaxis : {
            title:`Voter Turnout`
        }

    };

    Plotly.newPlot("plot1_plot",traceArray,layout);
}

function plot1_updatePlot(data,district_id){
    let district = district_id.split('SH')[1];
    plotRequest = d3.select("#plot1_selPlot").property('value')

    switch(plotRequest){
        case 'turn_dem':
            x = Object.values(data['Dem Vote %']);
            y = Object.values(data['Turnout']);
            title = `Voter Turnout vs. Results by Party (Democrats) <br> in State House District ${district}`;
            xtitle = 'Percent Democrat';
            break;
        case 'turn_rep':
            x = Object.values(data['Repub Vote %']);
            y = Object.values(data['Turnout']);
            title = `Voter Turnout vs. Results by Party (Republicans) <br> in State House District ${district}`;
            xtitle = 'Percent Republican';
            break;
        default:
            x = Object.values(data['Dem Vote %']);
            y = Object.values(data['Turnout']);
            title = `Voter Turnout vs. Results by Party (Democrats) <br> in State House District ${district}`;
            xtitle = 'Percent Democrat';
            break;
    }

    Plotly.update('plot1_plot',{x:[x],y:[y]},{title:title,xaxis:{title:xtitle}});
}

function plot1_summarize(data,district_id){
    let district = district_id.split('SH')[1];

    let demVotes = 0;
    let repVotes = 0;
    demVoteData = Object.values(data['Dem Vote %']);
    repVoteData = Object.values(data['Repub Vote %']);
    totalVoteData = Object.values(data['Total_Votes']);
    turnoutData = Object.values(data['Turnout']);

    for(i=0;i<demVoteData.length;i++){
        demVotes = demVotes + demVoteData[i]/100*totalVoteData[i];
        repVotes = repVotes + repVoteData[i]/100*totalVoteData[i];
    }
    
    
    let dem_pct = Math.round(demVotes/(demVotes+repVotes)*10000)/100;    
    let rep_pct = Math.round(repVotes/(demVotes+repVotes)*10000)/100;    

    pearson_r = pearsonR(demVoteData,turnoutData);

    is_correlated = (Math.abs(pearson_r)>=0.7);

    let plot1_text = `In the ${district}th district, of voters who supported either a democrat or a republican, ${dem_pct}% supported a democrat and ${rep_pct}% supported a republican.  We ${is_correlated ? 'did' : 'did not'} find a significant correlation between party affiliation and voter turnout by precinct.  The data have a correlation (pearson r) of ${pearson_r}. `

    d3.select('#plot1_summary').text(plot1_text)
}




d3.select('#plot1_selDistrict').on('change',plot1_fetchData);
d3.select('#plot1_selPlot').on('change',plot1_fetchData);
init();