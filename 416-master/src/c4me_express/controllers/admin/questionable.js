import { Student } from "../../database/schemas/Student"
import { HighSchool } from "../../database/schemas/HighSchool"

var appsize = 0;
async function calculate_Questionable_Reject_Decision(acceptanceDecision, userProfile){
    return ( 1 - await calculate_Questionable_Acceptance_Decision(acceptanceDecision, userProfile) )
}

function convertLetterGrade(g) {
    switch (g) {
        case "A+":
            return 4.0
            break
        case "A":
            return 3.6
            break
        case "A-":
            return 3.3
            break
        case "B+":
            return 3.0
            break
        case "B":
            return 2.7
            break
        case "B-":
            return 2.4
            break
        case "C+":
            return 2.1
            break
        case "C":
            return 1.8
            break
        case "C-":
            return 1.5
            break
        case "D+":
            return 1.2
            break
        case "D":
            return 0.9
            break
        case "D-":
            return 0.6
            break
        case "F":
            return 0.3
            break
    }
}

function removeAndSpreadWeights(criteria, section) {
    var toAdd = criteria[section]
    delete criteria[section]
    for (var key in criteria) {
        if (criteria.hasOwnProperty(key)) {
            criteria[key] += (toAdd / Object.keys(criteria).length)
        }
    }
}

function determine_similar_HS_value(hs1, hs2) {
    //console.log(hs1,hs2)
    var SIMILAR_HS_CONSTANTS = {
        //Doesnt matter bc we arnt getting "scores to display just to sort"
        TOTAL: {
            ACADEMIC_GRADE: 4.0,
            SAT: 1600,
            ACT: 36,
            GRADUATION_RATE: 100,
            STATE_TEST: 100,
        },

        WEIGHTS: {
            ACADEMIC_GRADE: 0.25,
            SAT: 0.25,
            ACT: 0.25,
            GRADUATION_RATE: 0.10,
            STATE_TEST_MATH: 0.0725,
            STATE_TEST_READING: 0.0725,
        },
    }


    var grade1 = convertLetterGrade(hs1.AcademicGrade)
    var grade2 = convertLetterGrade(hs2.AcademicGrade)
    var WeightedHS = calculate_weighted_score(grade1 - grade2, SIMILAR_HS_CONSTANTS.TOTAL.ACADEMIC_GRADE, 1)

    if (hs1.SAT > -1 && hs2.SAT > -1) {
        var WeightedSAT = calculate_weighted_score(hs1.SAT - hs2.SAT, SIMILAR_HS_CONSTANTS.TOTAL.SAT, 1)
    } else {
        //Both are unreported remove ACT criteria
        var WeightedSAT = 0
        removeAndSpreadWeights(SIMILAR_HS_CONSTANTS.WEIGHTS, "SAT")
    }

    if (hs1.ACT > -1 && hs2.ACT > -1) {
        var WeightedACT = calculate_weighted_score(hs1.ACT - hs2.ACT, SIMILAR_HS_CONSTANTS.TOTAL.ACT, 1)
    } else {
        //Both are unreported remove ACT criteria
        var WeightedACT = 0
        removeAndSpreadWeights(SIMILAR_HS_CONSTANTS.WEIGHTS, "ACT")
    }

    if (hs1.graduationRate > -1 && hs2.graduationRate > -1) {
        var WeightedGradRate = calculate_weighted_score(hs1.graduationRate - hs2.graduationRate, SIMILAR_HS_CONSTANTS.TOTAL.GRADUATION_RATE, 1)
    } else {
        //Both are unreported remove ACT criteria
        var WeightedGradRate = 0
        removeAndSpreadWeights(SIMILAR_HS_CONSTANTS.WEIGHTS, "GRADUATION_RATE")
    }

    if (hs1.stateMath > -1 && hs2.stateMath > -1) {
        var WeightedStateMath = calculate_weighted_score(hs1.stateMath - hs2.stateMath, SIMILAR_HS_CONSTANTS.TOTAL.STATE_TEST, 1)
    } else {
        //Both are unreported remove ACT criteria
        var WeightedStateMath = 0
        removeAndSpreadWeights(SIMILAR_HS_CONSTANTS.WEIGHTS, "STATE_TEST_MATH")
    }
    if (hs1.stateReading > -1 && hs2.stateReading > -1) {
        var WeigthedStateReading = calculate_weighted_score(hs1.stateReading - hs2.stateReading, SIMILAR_HS_CONSTANTS.TOTAL.STATE_TEST, 1)
    } else {
        //Both are unreported remove ACT criteria
        var WeigthedStateReading = 0
        removeAndSpreadWeights(SIMILAR_HS_CONSTANTS.WEIGHTS, "STATE_TEST_MATH")
    }

    if (SIMILAR_HS_CONSTANTS.WEIGHTS.ACADEMIC_GRADE != undefined)
        WeightedHS = WeightedHS * SIMILAR_HS_CONSTANTS.WEIGHTS.ACADEMIC_GRADE

    if (SIMILAR_HS_CONSTANTS.WEIGHTS.SAT != undefined)
        WeightedSAT = WeightedSAT * SIMILAR_HS_CONSTANTS.WEIGHTS.SAT

    if (SIMILAR_HS_CONSTANTS.WEIGHTS.ACT != undefined)
        WeightedACT = WeightedACT * SIMILAR_HS_CONSTANTS.WEIGHTS.ACT

    if (SIMILAR_HS_CONSTANTS.WEIGHTS.GRADUATION_RATE != undefined)
        WeightedGradRate = WeightedGradRate * SIMILAR_HS_CONSTANTS.WEIGHTS.GRADUATION_RATE

    if (SIMILAR_HS_CONSTANTS.WEIGHTS.STATE_TEST_MATH != undefined)
        WeightedStateMath = WeightedStateMath * SIMILAR_HS_CONSTANTS.WEIGHTS.STATE_TEST_MATH

    if (SIMILAR_HS_CONSTANTS.WEIGHTS.STATE_TEST_READING != undefined)
        WeigthedStateReading = WeigthedStateReading * SIMILAR_HS_CONSTANTS.WEIGHTS.STATE_TEST_READING

    //console.log(WeightedHS, WeightedSAT, WeightedACT, WeightedGradRate, WeightedStateMath, WeigthedStateReading)

    var similarity = WeightedHS + WeightedSAT + WeightedACT + WeightedGradRate + WeightedStateMath + WeigthedStateReading

    return similarity
}

async function determine_Better_Profile(profile1, profile2) {
    //console.log("better");
    //console.log(profile1,profile2)
    var BETTER_STUDENT_CONSTANTS = {
        TOTALS: {
            GPA: 1.5, //Played around with these numbers and found optimal one
            SAT: 800, //Played around with these numbers and found optimal one
            ACT: 18, //Played around with these numbers and found optimal one
            HS: 1, //Function returns val out of 1
        },
        WEIGHTS: {
            GPA: 0.4,
            SAT: 0.2,
            ACT: 0.2,
            HS: 0.2,
        },
        BIAS: {
            GPA: 0.05, //Played around with these numbers and found optimal one
            SAT: 50, //Played around with these numbers and found optimal one
            ACT: 2, //Played around with these numbers and found optimal one
            HS: 0.2, //Function returns val out of 1
        }

    }

    var gpaScore = 0
    if (profile1.gpa > -1 && profile2.gpa > -1) {
        gpaScore = calculate_acceptance_score(profile1.gpa , profile2.gpa, BETTER_STUDENT_CONSTANTS.TOTALS.GPA, 1, BETTER_STUDENT_CONSTANTS.BIAS.GPA) //Get full results and multiply by weights later if they change

    } else {
        //At least one is unreported remove GPA criteria
        removeAndSpreadWeights(BETTER_STUDENT_CONSTANTS.WEIGHTS, "GPA")
    }
    var WeightedACT = 0
    if (profile1.ACT_composite > -1 && profile2.ACT_composite > -1) {
        WeightedACT = calculate_acceptance_score(profile1.ACT_composite , profile2.ACT_composite, BETTER_STUDENT_CONSTANTS.TOTALS.ACT, 1, BETTER_STUDENT_CONSTANTS.BIAS.ACT)
    } else {
        //At least one is unreported remove ACT criteria
        removeAndSpreadWeights(BETTER_STUDENT_CONSTANTS.WEIGHTS, "ACT")
    }

    var WeightedSAT = 0
    if (profile1.SAT_EBRW > -1 && profile2.SAT_EBRW > -1 && profile1.SAT_math > -1 && profile2.SAT_math > -1) { //MAKE SURE IF USER ENTERS ONE SAT_EBRW !! IT MSUT ENTER MATH RESTRICT THIS*********************************
        let WeightedSATEBRW = calculate_acceptance_score(profile1.SAT_EBRW , profile2.SAT_EBRW, BETTER_STUDENT_CONSTANTS.TOTALS.SAT / 2, 0.5, BETTER_STUDENT_CONSTANTS.BIAS.SAT/2) //Get full results and multiply by weights later if they change
        let WeightedSATMATH = calculate_acceptance_score(profile1.SAT_math , profile2.SAT_math, BETTER_STUDENT_CONSTANTS.TOTALS.SAT / 2, 0.5, BETTER_STUDENT_CONSTANTS.BIAS.SAT/2)
        WeightedSAT = WeightedSATMATH + WeightedSATEBRW
    } else {
        //At least one is unreported remove SAT criteria
        removeAndSpreadWeights(BETTER_STUDENT_CONSTANTS.WEIGHTS, "SAT")
    }

    var WeightedHS = 0
    
    if (profile1.high_school_name != "" && profile2.high_school_name != "") 
    {
        let hsprofile1 = await HighSchool.findOne({name : profile1.high_school_name,scrapped :true})
        let hsprofile2 = await HighSchool.findOne({name : profile2.high_school_name,scrapped :true})
        if(hsprofile1 != null && hsprofile2 != null)
            WeightedHS = determine_similar_HS_value(hsprofile1, hsprofile2)
    } else {
        //At least one is unreported remove HS criteria
        removeAndSpreadWeights(BETTER_STUDENT_CONSTANTS.WEIGHTS, "HS")
    }

    if (BETTER_STUDENT_CONSTANTS.WEIGHTS.GPA != undefined)
        gpaScore = gpaScore * BETTER_STUDENT_CONSTANTS.WEIGHTS.GPA
    if (BETTER_STUDENT_CONSTANTS.WEIGHTS.SAT != undefined)
        WeightedSAT = WeightedSAT * BETTER_STUDENT_CONSTANTS.WEIGHTS.SAT
    if (BETTER_STUDENT_CONSTANTS.WEIGHTS.ACT != undefined)
        WeightedACT = WeightedACT * BETTER_STUDENT_CONSTANTS.WEIGHTS.ACT
    if (BETTER_STUDENT_CONSTANTS.WEIGHTS.HS != undefined)
        WeightedHS = WeightedHS * BETTER_STUDENT_CONSTANTS.WEIGHTS.HS

    //console.log("1",gpaScore, WeightedSAT, WeightedACT, WeightedHS)

    let final_score = (gpaScore + WeightedSAT + WeightedACT + WeightedHS)
    return final_score
}


async function calculate_Questionable_Acceptance_Decision(acceptanceDecision, userProfile)
{
    try
    {
        //console.log(userProfile);
        var college = acceptanceDecision.college
        //console.log(college);
        var QUESTIONABLE_CONSTANTS = {
            TOTALS: {
                GPA: 1.0, //Played around with these numbers and found optimal one
                SAT: 400, //Played around with these numbers and found optimal one
                ACT: 15, //Played around with these numbers and found optimal one
            },
            WEIGHTS: {
                GPA: 0.4,
                SAT: 0.25,
                ACT: 0.25,
                SIMILAR_STUDENTS: 0.1,
            },
            BIAS: { //SMALL AMOUNT FROM AVG TO CHECK BOUNDRIES
                GPA: 0.05,
                SAT: 20,
                ACT: 1,
            }

        }
        //If college doesnt report gpa, remove criteria
        var gpaScore = 0
        if (college.avgGpa < 0 || userProfile.gpa < 0) {
            removeAndSpreadWeights(QUESTIONABLE_CONSTANTS.WEIGHTS, "GPA")
        } else {
            //GPA -  If the difference between the two is greater than Total, the similarity is just 0.
            gpaScore = calculate_acceptance_score( userProfile.gpa, college.avgGpa, QUESTIONABLE_CONSTANTS.TOTALS.GPA, 1, QUESTIONABLE_CONSTANTS.BIAS.GPA) //Get full results and multiply by weights later if they change
        }
        var WeightedACT = 0
        if (college.ACT_Composite > -1 && userProfile.ACT_composite > -1) {
            WeightedACT = calculate_acceptance_score( userProfile.ACT_composite, college.ACT_Composite ,QUESTIONABLE_CONSTANTS.TOTALS.ACT, 1, QUESTIONABLE_CONSTANTS.BIAS.ACT)
        } else {
            //At least one is unreported remove ACT criteria
            removeAndSpreadWeights(QUESTIONABLE_CONSTANTS.WEIGHTS, "ACT")
        }

        var WeightedSAT = 0
        if (college.SAT_EBRW > -1 && userProfile.SAT_EBRW > -1 && college.SAT_math > -1 && userProfile.SAT_math > -1) {
            let WeightedSATEBRW = calculate_acceptance_score(userProfile.SAT_EBRW, college.SAT_EBRW , QUESTIONABLE_CONSTANTS.TOTALS.SAT / 2, 0.5, QUESTIONABLE_CONSTANTS.BIAS.SAT/2) //Get full results and multiply by weights later if they change
            let WeightedSATMATH = calculate_acceptance_score(userProfile.SAT_math, college.SAT_math , QUESTIONABLE_CONSTANTS.TOTALS.SAT / 2, 0.5, QUESTIONABLE_CONSTANTS.BIAS.SAT/2)
            WeightedSAT = WeightedSATMATH + WeightedSATEBRW
        } else {
            //At least one is unreported remove SAT criteria
            removeAndSpreadWeights(QUESTIONABLE_CONSTANTS.WEIGHTS, "SAT")
        }


        //Check how many similar students were accepted to the school
        var SimilarStudentsScore = 0
        var total = 0
        var numSimStudents = 0
        if (college.applications.length < 1 || appsize > 1000) {
            removeAndSpreadWeights(QUESTIONABLE_CONSTANTS.WEIGHTS, "SIMILAR_STUDENTS")
        } else {
            //Loop through all acceptance decisions for the college
            for (let i = 0; i < college.applications.length; i += 5) {
                let application = college.applications[i];
                //console.log("@@@@@@@@@@@");
                if(application.status == "accepted") //If status is accepted then we compute
                {
                    //console.log("53erwfs");
                    let studentprofile = await Student.findOne({userid : application.userid});
                    if(studentprofile == null)
                    {
                        console.log("unable to find student profile info at questionable decision");
                        continue;
                    }
                    //console.log(studentprofile,userProfile)
                    let similarScore = await determine_Better_Profile(studentprofile, userProfile)
                    if (similarScore > 0.65) {
                        numSimStudents += 1
                    }
                }
                total += 1
                //console.log("toteal is "+ total);
            }
            //Compare each student to user using determine_Similar_Profiles()
            //numSimStudents = number of students with 75% or more similar profile to the user
            SimilarStudentsScore = numSimStudents / total * QUESTIONABLE_CONSTANTS.WEIGHTS.SIMILAR_STUDENTS
            //console.log(SimilarStudentsScore,QUESTIONABLE_CONSTANTS.WEIGHTS.SIMILAR_STUDENTS)
        }


        if (QUESTIONABLE_CONSTANTS.WEIGHTS.GPA != undefined)
            gpaScore = gpaScore * QUESTIONABLE_CONSTANTS.WEIGHTS.GPA
        if (QUESTIONABLE_CONSTANTS.WEIGHTS.SAT != undefined)
            WeightedSAT = WeightedSAT * QUESTIONABLE_CONSTANTS.WEIGHTS.SAT
        if (QUESTIONABLE_CONSTANTS.WEIGHTS.ACT != undefined)
            WeightedACT = WeightedACT * QUESTIONABLE_CONSTANTS.WEIGHTS.ACT
        if (QUESTIONABLE_CONSTANTS.WEIGHTS.SIMILAR_STUDENTS != undefined)
            SimilarStudentsScore = SimilarStudentsScore * QUESTIONABLE_CONSTANTS.WEIGHTS.SIMILAR_STUDENTS

        //console.log(gpaScore, WeightedSAT, WeightedACT, SimilarStudentsScore)

        let final_score = (gpaScore + WeightedSAT + WeightedACT + SimilarStudentsScore)
        console.log(final_score)
        return final_score
    }
    catch(err)
    {
        console.log("error in questionable decision"+ err);
        return 0;
    }
}


export async function detect_Questionable_Decision(acceptanceDecision, userProfile,numApps){
    var score = -1
    var status = acceptanceDecision.status
    //console.log(numApps);
    appsize = numApps;
    if(status == 'accepted')
    {
        score = await calculate_Questionable_Acceptance_Decision(acceptanceDecision, userProfile)
        //console.log(userProfile.SAT_EBRW,userProfile.SAT_math,userProfile.ACT_composite,userProfile.gpa)
        //console.log(acceptanceDecision.college.SAT_EBRW,acceptanceDecision.college.SAT_math,acceptanceDecision.college.ACT_Composite,acceptanceDecision.college.avgGpa)
        //console.log("accepted",score);
        if (score > 0.75)
            return false
        return true;
    }
    if(status == 'denied')
    {

        score = await calculate_Questionable_Reject_Decision(acceptanceDecision, userProfile)
        /*
        console.log(userProfile.SAT_EBRW,userProfile.SAT_math,userProfile.ACT_composite,userProfile.gpa)
        console.log(acceptanceDecision.college.SAT_EBRW,acceptanceDecision.college.SAT_math,acceptanceDecision.college.ACT_Composite,acceptanceDecision.college.avgGpa)
        console.log("Denied",score);*/
        if (score > 0.25)
        {
            return false
        }
        //console.log(userProfile.SAT_EBRW,userProfile.SAT_math,userProfile.ACT_composite,userProfile.gpa)
        //console.log(acceptanceDecision.college.SAT_EBRW,acceptanceDecision.college.SAT_math,acceptanceDecision.college.ACT_Composite,acceptanceDecision.college.avgGpa)
        //console.log("Denied",score);
        return true;
    }
    //console.log(score);
    return false;
}

/* 
    Purpose: Compute a value out of 1.0 of how similar paramater hs1 is to hs2 (Highschools)

    Details:
     - Function uses a CONSTANTS object to control missing data, and to make code cleaner.
*/
function calculate_weighted_score(difference, total, weight) {
    if (Math.abs(difference) > total)
        return 0
    return (1 - Math.abs((difference / total))) * weight
}

function calculate_acceptance_score(student_score, college_avg, total,  weight, bias)
{
    //If student_score < college_avg + bias, then the student’s score is lower, and we use a weight formula:
    if(student_score < college_avg + bias )
    {
        //console.log(student_score, college_avg)
        return calculate_weighted_score( (student_score - college_avg), total, weight)
    }
    //If student_score > college_avg, then the student’s score is higher, and we say the decision for this criteria is 100% likely
    return weight;
}

