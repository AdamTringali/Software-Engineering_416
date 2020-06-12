//const fs = require('fs');
//const Papa = require('papaparse');

import fs from 'fs'
import Papa from 'papaparse'
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url)) + '/';

var SAT_CSV_PATH = __dirname+ "SAT Composite Scores.csv"
var SAT_SUBJECT_CSV_PATH = __dirname+"SAT Subject Tests.csv"
var ACT_CSV_PATH = __dirname+"ACT Scores.csv"

var SAT_PERCENTILES = csvToArray(SAT_CSV_PATH)
var ACT_PERCENTILES = csvToArray(ACT_CSV_PATH)
var SAT_SUBJECT_PERCENTILES = csvToArray(SAT_SUBJECT_CSV_PATH)

function csvToArray(file)
{
	let percentile_array = []
	try {
        var data = fs.readFileSync(file).toString().split('\n');
        for (let i = 0; i < data.length; i++) {
            var parse_response = Papa.parse(data[i]);
            if (parse_response["errors"].length != 0) {
                continue;
			}
			data[i] = parse_response["data"][0];
			percentile_array.push(data[i])
        }
    } catch (err) {
        console.log("Error importing csv " + err);
	}
	return percentile_array
}


function structureStudentProfile(userProfile) {
    userProfile.tests = {
        SAT_subject_tests: {
            SAT_literature: roundTo10(userProfile.SAT_literature),
            SAT_US_hist: roundTo10(userProfile.SAT_US_hist),
            SAT_world_hist: roundTo10(userProfile.SAT_world_hist),
            SAT_math_I: roundTo10(userProfile.SAT_math_I),
            SAT_math_II: roundTo10(userProfile.SAT_math_II),
            SAT_eco_bio: roundTo10(userProfile.SAT_eco_bio),
            SAT_mol_bio: roundTo10(userProfile.SAT_mol_bio),
            SAT_chemistry: roundTo10(userProfile.SAT_chemistry),
            SAT_physics: roundTo10(userProfile.SAT_physics),
        },
        ACT_subject_tests: {
            ACT_English: userProfile.ACT_English,
            ACT_math: userProfile.ACT_math,
            ACT_reading: userProfile.ACT_reading,
            ACT_science: userProfile.ACT_science,
        },
        composite_scores: {
            SAT_math: roundTo10(userProfile.SAT_math),
            SAT_EBRW: roundTo10(userProfile.SAT_EBRW),
            ACT_composite: userProfile.ACT_composite,
        },
    }
    return userProfile
}


function roundTo10(N){
    return Math.ceil(N / 10) * 10;
}

export function percentileAverage(userProfile) {

    userProfile = structureStudentProfile(userProfile)

	var num_subject_tests = 0
	var SAT_SUBJECT_TEST_WEIGHT = 0.05

	var userSubjectTests = userProfile.tests.SAT_subject_tests


	var final_score = 0

	for (var subject_test in userSubjectTests) {
		var subject_test_score = userSubjectTests[subject_test]

		if (subject_test_score != -1) {
            var percentile = calculatePercentile(subject_test, subject_test_score)
            //console.log(subject_test, percentile)
			final_score += percentile * SAT_SUBJECT_TEST_WEIGHT
			num_subject_tests += 1
        }
	}
	var percent_remaining =  1 - num_subject_tests * 0.05
	var ACT_WEIGHT = 0
	var SAT_WEIGHT = 0

	var composite_scores = userProfile.tests.composite_scores
	if (composite_scores.SAT_EBRW > -1 && composite_scores.SAT_math > -1 && composite_scores.ACT_composite > -1) {
		//Split equally
		//console.log("Took both tests")
		ACT_WEIGHT = percent_remaining / 2
		SAT_WEIGHT = percent_remaining / 2

        
        var SAT_EBRW_percentile = calculatePercentile("SAT_EBRW", composite_scores["SAT_EBRW"])
        var SAT_math_percentile = calculatePercentile("SAT_math", composite_scores["SAT_math"])
        final_score += (SAT_EBRW_percentile * SAT_WEIGHT/2) + (SAT_math_percentile * SAT_WEIGHT/2)
    
		var ACTpercentile = calculatePercentile("ACT_composite", composite_scores["ACT_composite"])
		final_score += ACTpercentile * ACT_WEIGHT
	} else if (composite_scores.SAT_EBRW > -1 && composite_scores.SAT_math > -1) {
		//Only took SAT
		console.log("Took SAT Only")

		SAT_WEIGHT = percent_remaining
		percentile = calculatePercentile("SAT_EBRW", composite_scores["SAT_EBRW"])*SAT_WEIGHT/2
		percentile2 = calculatePercentile("SAT_math", composite_scores["SAT_math"])*SAT_WEIGHT/2
		final_score += percentile + percentile2


	} else if (composite_scores.ACT_composite > -1 ) {
		//Only took ACt
		console.log("Took ACT Only")
		ACT_WEIGHT = percent_remaining

		percentile = calculatePercentile("ACT_composite", composite_scores["ACT_composite"])
		final_score += percentile * ACT_WEIGHT
	}
	else{
		//TOOK NONE!
		console.log("Took Only Subject Tests")
		final_score = 0
		var num_tests_taken = 0
		for(subject_test in userSubjectTests) {
			var subject_test_score = userSubjectTests[subject_test]
			if (subject_test_score != -1) {
				num_tests_taken += 1
			}
		}

		SAT_SUBJECT_TEST_WEIGHT = 1/num_tests_taken

		for(subject_test in userSubjectTests) {
			console.log(subject_test)
			var subject_test_score = userSubjectTests[subject_test]
			if (subject_test_score != -1) {
				percentile = calculatePercentile(subject_test, subject_test_score)
				//console.log(subject_test, percentile)
				final_score += percentile * SAT_SUBJECT_TEST_WEIGHT
				num_subject_tests += 1
			}
		}
	}
    return final_score
}


function calculatePercentile(subjectName, score) {
	switch (subjectName) {
		case "SAT_literature":
		case "SAT_US_hist":
		case "SAT_world_hist":
		case "SAT_math_I":
		case "SAT_math_II":
		case "SAT_eco_bio":
		case "SAT_mol_bio":
		case "SAT_chemistry":
		case "SAT_physics":
			if(score < 200)
				return 0
			if(score > 800)
				return 100
			return percentileFromCSV(SAT_SUBJECT_PERCENTILES, subjectName, score)
		case "SAT_math":
		case "SAT_EBRW":
			if(score < 200)
				return 0
			if(score > 800)
				return 100
            return percentileFromCSV(SAT_PERCENTILES, subjectName, score)
		case "ACT_composite":
			if(score < 1)
				return 0
			if(score > 36)
				return 100
            return percentileFromCSV(ACT_PERCENTILES, subjectName, score)
	}
}


function percentileFromCSV(percentile_array, type, score) 
{
    var percentile = -1
    var colIndex = -1

    for (let i = 0; i < percentile_array.length; i++) {
		var row = percentile_array[i]
		if (i == 0) {//If this is the header row, (index 0) set indices for info we want.
			colIndex = row.indexOf(type)
		}
		else {
			if(row[0] == score.toString())
				percentile = row[colIndex]
		}
	}
    return percentile;
}



var sampleProfile = {
	SAT_math: 670,
	SAT_EBRW: 750,
	ACT_English: 35,
	ACT_math: 28,
	ACT_reading: 33,
	ACT_science: 32,
	ACT_composite: 32,
	SAT_literature: 740,
	SAT_US_hist: 680,
	SAT_world_hist: 690,
	SAT_math_I: -1,
	SAT_math_II: -1,
	SAT_eco_bio: -1,
	SAT_mol_bio: -1,
	SAT_chemistry: -1,
	SAT_physics: -1,
}

//console.log(percentileAverage(sampleProfile))