# Dependencies and Imports
import pandas as pd
import numpy as np
from scipy.stats import linregress
import matplotlib.pyplot as plt
import os

plotting = False

def import_for_result_totals():
    file_path = os.path.join("CSVs",'election_data_clean.csv')
    elec_data= pd.read_csv(file_path,index_col=0,dtype = {3:str,4:str})

    contests = elec_data.groupby('Contest Code')

    #Creates a data frame to allow for looking up contest codes, names, and districts
    contest_dict = {}
    for x in contests.groups.keys():
        df = contests.get_group(x)
        name = df['Contest Name'].unique()[0]
        dist = df['District'].unique()[0]
        contest_dict[x] = {'Name' : name , 'District' : dist}

    contest_info = pd.DataFrame(contest_dict).transpose()
    contest_info.index.name = 'Contest Code'
    contest_info['Contest Code'] = contest_info.index
    contest_info = contest_info.set_index(['Name','District'])
    return {'contest_info':contest_info,'contests':contests}

# The function get_results() gives the results of a contest
def get_results(contest_name = None,district = ' ',code = None):
    if (not plotting):
        imports = import_for_result_totals()
        contest_info = imports['contest_info']
        contests = imports['contests']
        
    input_district = district
    if code is None:
        def lookup(name=contest_name,dist=district):
            contest = (name,dist)
            output_code = contest_info.loc[contest,'Contest Code'][0]
            return output_code
        try:
            code = lookup()
        except KeyError:
            try:
                new_district = " " + str(input_district)
                code = lookup(dist = new_district)
            except KeyError:
                try:
                    new_district=" District " + str(input_district)
                    code = lookup(dist = new_district)
                except KeyError:
                    try:
                        possible_values = list(contest_info.loc[contest_name,:].index)
                        return {'Type':'Error',
                                'Response':{'Error' : 'District Does Not Exist' , 'Possible Values' : possible_values}}
                    except KeyError:
                        return {'Type':'Error',
                                'Response':{'Error' : 'Contest Name Does Not Exist'}}
                    
    else:
        try:
            row = contest_info[contest_info['Contest Code']==code]
            contest = list(row.index)[0]
            contest_name = contest[0]
            district = contest[1]
        except IndexError:
            return {'Type':'Error',
                    'Response':{'Error' : 'Contest Code Name Does Not Exist'}}
    
    
    df = contests.get_group(code)
    candidates = df['Candidate'].unique()
    parties = []
    for candidate in candidates:
        try:
            party = df[df['Candidate']==candidate]['Party'].iloc[0]
            parties.append(party)
        except KeyError:
            parties.append("None")
   
    df = df.set_index(['County Code','Precinct_Full_ID','Candidate'])
    
    
    return {'Type':'Data',
            'Response':{
                'Contest Name' : contest_name,
                'District' : district,
                'Code' : code,
                'Candidates' : candidates,
                'Parties' : parties,
                'Data' : df
            }} 

# The function plot_results() outputs the data necessary for a plotly plot
def plot_results(contest_name = None,district = ' ',code = None,by_County = False, by_Precinct = False):
    plotting = True
    
    imports = import_for_result_totals()
    contest_info = imports['contest_info']
    contests = imports['contests']
    
    results = get_results(contest_name,district,code)
    
    def get_total(df,candidate):
        return df.xs(candidate,level=2)['Vote Total'].sum()
    
    if results['Type'] == 'Error':
        pass
    
    else:
        if by_Precinct:
            response = results['Response']
            precincts = response['Data'].index.unique(level=1)
            candidates = list(response['Candidates'])
            parties = list(response['Parties'])
            return_data = []
            for precinct in precincts:
                try:
                    df = response['Data'].xs(precinct,level=1,drop_level=False)
                    x = [candidates[i] + f"\n({parties[i]})" for i in range(len(candidates))]
                    y = [get_total(df,candidate) for candidate in candidates]
                    return_data.append({'x':x,'y':y,'scope':f'{precinct}'})
                except KeyError:
                    pass
        elif by_County:
            response = results['Response']
            counties = response['Data'].index.unique(level=0)
            candidates = list(response['Candidates'])
            parties = list(response['Parties'])
            return_data = []
            for county in counties:
                try:
                    df = response['Data'].xs(county,level=0,drop_level=False)
                    x = [candidates[i] + f"\n({parties[i]})" for i in range(len(candidates))]
                    y = [get_total(df,candidate) for candidate in candidates]
                    return_data.append({'x':x,'y':y,'scope':f'{county}'})
                except KeyError:
                    pass
        else:
            response = results['Response']
            candidates = list(response['Candidates'])
            parties = list(response['Parties'])
            df = response['Data']
            x = [candidates[i] + f"\n({parties[i]})" for i in range(len(candidates))]
            y = [get_total(df,candidate) for candidate in candidates]
            return_data = [{'x':x,'y':y,'scope':'All Votes'}]
   
    
        results['Response']['Data'] = return_data
    return results
    