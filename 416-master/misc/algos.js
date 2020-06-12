function calculate_weighted_score(difference, total, weight) {
    if (difference > total)
        return 0
    return (1 - Math.abs((difference / total))) * weight
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

function compute_similar_HighSchools(hs_collection, userHS, numToDisplay) {
    var similar_hs_list = []
    for (hs in hs_collection) {
        scoredHs = hs
        hs.similarScore = determine_similar_HS_value(userHs, hs)
        similar_hs_list.append(scoredHs)
    }
    similar_hs_list.sort((a, b) => (a.similarScore > b.similarScore) ? 1 : -1)
    similar_hs_list = similar_hs_list.slice(0, numToDisplay)
    return similar_hs_list
}

function determine_similar_HS_value(hs1, hs2) {
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


    var grade1 = convertLetterGrade(hs1.overallAcademicGrade)
    var grade2 = convertLetterGrade(hs2.overallAcademicGrade)
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
        var WeigthedStateReading = calculate_weighted_score(hs1.stateReading - hs2.stateReading, SIMILAR_HS_CONSTANTS.TOTAL.STATE_TEST, SIMILAR_HS_CONSTANTS.WEIGHTS.STATE_TEST_READING)
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


function compute_College_Recommendation_Score(college_collection, userProfile) {
    var new_college_collection = []
    for (college in college_collection) {

        college.similarScore = computeCollegeSimilarityScore(college, userProfile)
        new_college_collection.append(college)
    }
    var recommended_Colleges_List = similar_hs_list.sort((a, b) => (a.similarScore > b.similarScore) ? 1 : -1)
    return recommended_Colleges_List
}

function computeCollegeSimilarityScore(college, userProfile) {
    var SIMILAR_COLLEGE_CONSTANTS = {
        TOTALS: {
            GPA: 1.5, //Played around with these numbers and found optimal one
            SAT: 800, //Played around with these numbers and found optimal one
            ACT: 18, //Played around with these numbers and found optimal one
        },
        WEIGHTS: {
            GPA: 0.2,
            SAT: 0.2,
            ACT: 0.2,
            SIMILAR_STUDENTS: 0.4,
        },

    }
    //Check if the college has one of your listed majors. If not, assign score 1.0 to the college and continue to next one
    if (!(college.majors.includes(userProfile.major_1) || college.majors.includes(userProfile.major_2))) {
        return 0.1
    }

    //If it does have the listed major do these calculations to get a accurate score:

    //If college doesnt report gpa, remove criteria
    var gpaScore = 0
    if (college.gpa < 0 || userProfile.gpa < 0) {
        removeAndSpreadWeights(SIMILAR_COLLEGE_CONSTANTS.WEIGHTS, "GPA")
    } else {
        //GPA -  If the difference between the two is greater than Total, the similarity is just 0.
        gpaScore = calculate_weighted_score(college.gpa - userProfile.gpa, SIMILAR_COLLEGE_CONSTANTS.TOTALS.GPA, 1) //Get full results and multiply by weights later if they change

    }
    var WeightedACT = 0
    if (college.ACT_composite > -1 && userProfile.ACT_composite > -1) {
        WeightedACT = calculate_weighted_score(college.ACT_composite - userProfile.ACT_composite, SIMILAR_COLLEGE_CONSTANTS.TOTALS.ACT, 1)
    } else {
        //At least one is unreported remove ACT criteria
        removeAndSpreadWeights(SIMILAR_COLLEGE_CONSTANTS.WEIGHTS, "ACT")
    }

    var WeightedSAT = 0
    if (college.SAT_EBRW > -1 && userProfile.SAT_EBRW > -1) {
        WeightedSATEBRW = calculate_weighted_score(college.SAT_EBRW - userProfile.SAT_EBRW, SIMILAR_COLLEGE_CONSTANTS.TOTALS.SAT / 2, 0.5) //Get full results and multiply by weights later if they change
        WeightedSATMATH = calculate_weighted_score(college.SAT_math - userProfile.SAT_math, SIMILAR_COLLEGE_CONSTANTS.TOTALS.SAT / 2, 0.5)
        WeightedSAT = WeightedSATMATH + WeightedSATEBRW
    } else {
        //At least one is unreported remove SAT criteria
        removeAndSpreadWeights(SIMILAR_COLLEGE_CONSTANTS.WEIGHTS, "SAT")
    }


    //Check how many similar students were accepted to the school
    var SimilarStudentsScore = 0
    var total = 0
    var numSimStudents = 0
    if (college.acceptanceDecisions.length < 1) {
        removeAndSpreadWeights(SIMILAR_COLLEGE_CONSTANTS.WEIGHTS, "SIMILAR_STUDENTS")
    } else {
        //Loop through all acceptance decisions for the college
        for (application in college.applications) {
            if(application.status == true) //If status is accepted then we compute
            {
                let similarScore = determine_Similar_Profiles(application.student, userProfile)
                if (similarScore > 0.75) {
                    numSimStudents += 1
                }
                total += 1
            }
        }
        //Compare each student to user using determine_Similar_Profiles()
        //numSimStudents = number of students with 75% or more similar profile to the user
        SimilarStudentsScore = numSimStudents / total * SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.SIMILAR_STUDENTS
    }

    if (SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.GPA != undefined)
        gpaScore = gpaScore * SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.GPA
    if (SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.SAT != undefined)
        WeightedSAT = WeightedSAT * SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.SAT
    if (SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.ACT != undefined)
        WeightedACT = WeightedACT * SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.ACT
    if (SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.SIMILAR_STUDENTS != undefined)
        SimilarStudentsScore = SimilarStudentsScore * SIMILAR_COLLEGE_CONSTANTS.WEIGHTS.SIMILAR_STUDENTS

    //console.log(gpaScore, WeightedSAT, WeightedACT, SimilarStudentsScore)

    final_score = (gpaScore + WeightedSAT + WeightedACT + SimilarStudentsScore)
    return final_score
}


function determine_Similar_Profile(profile1, profile2) {
    var SIMILAR_STUDENT_CONSTANTS = {
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

    }

    var gpaScore = 0
    if (profile1.gpa > -1 && profile2.gpa > -1) {
        gpaScore = calculate_weighted_score(profile1.gpa - profile2.gpa, SIMILAR_STUDENT_CONSTANTS.TOTALS.GPA, 1) //Get full results and multiply by weights later if they change

    } else {
        //At least one is unreported remove GPA criteria
        removeAndSpreadWeights(SIMILAR_STUDENT_CONSTANTS.WEIGHTS, "GPA")
    }
    var WeightedACT = 0
    if (profile1.ACT_composite > -1 && profile2.ACT_composite > -1) {
        WeightedACT = calculate_weighted_score(profile1.ACT_composite - profile2.ACT_composite, SIMILAR_STUDENT_CONSTANTS.TOTALS.ACT, 1)
    } else {
        //At least one is unreported remove ACT criteria
        removeAndSpreadWeights(SIMILAR_STUDENT_CONSTANTS.WEIGHTS, "ACT")
    }

    var WeightedSAT = 0
    if (profile1.SAT_EBRW > -1 && profile2.SAT_EBRW > -1) { //MAKE SURE IF USER ENTERS ONE SAT_EBRW !! IT MSUT ENTER MATH RESTRICT THIS*********************************
        WeightedSATEBRW = calculate_weighted_score(profile1.SAT_EBRW - profile2.SAT_EBRW, SIMILAR_STUDENT_CONSTANTS.TOTALS.SAT / 2, 0.5) //Get full results and multiply by weights later if they change
        WeightedSATMATH = calculate_weighted_score(profile1.SAT_math - profile2.SAT_math, SIMILAR_STUDENT_CONSTANTS.TOTALS.SAT / 2, 0.5)
        WeightedSAT = WeightedSATMATH + WeightedSATEBRW
    } else {
        //At least one is unreported remove SAT criteria
        removeAndSpreadWeights(SIMILAR_STUDENT_CONSTANTS.WEIGHTS, "SAT")
    }

    var WeightedHS = 0
    if (profile1.high_school != null && profile2.high_school != null) {
        WeightedHS = determine_similar_HS_value(profile1.high_school, profile2.high_school)
    } else {
        //At least one is unreported remove HS criteria
        removeAndSpreadWeights(SIMILAR_STUDENT_CONSTANTS.WEIGHTS, "HS")
    }

    if (SIMILAR_STUDENT_CONSTANTS.WEIGHTS.GPA != undefined)
        gpaScore = gpaScore * SIMILAR_STUDENT_CONSTANTS.WEIGHTS.GPA
    if (SIMILAR_STUDENT_CONSTANTS.WEIGHTS.SAT != undefined)
        WeightedSAT = WeightedSAT * SIMILAR_STUDENT_CONSTANTS.WEIGHTS.SAT
    if (SIMILAR_STUDENT_CONSTANTS.WEIGHTS.ACT != undefined)
        WeightedACT = WeightedACT * SIMILAR_STUDENT_CONSTANTS.WEIGHTS.ACT
    if (SIMILAR_STUDENT_CONSTANTS.WEIGHTS.HS != undefined)
        WeightedHS = WeightedHS * SIMILAR_STUDENT_CONSTANTS.WEIGHTS.HS

    //console.log(gpaScore, WeightedSAT, WeightedACT, SimilarStudentsScore)

    final_score = (gpaScore + WeightedSAT + WeightedACT + WeightedHS)
    //console.log(final_score)
    return final_score
}


function detect_Questionable_Decision(acceptanceDecision, userProfile)
{
   var college = acceptanceDecision.college
    var QUESTIONABLE_CONSTANTS = {
        TOTALS: {
            GPA: 1.0, //Played around with these numbers and found optimal one
            SAT: 800, //Played around with these numbers and found optimal one
            ACT: 18, //Played around with these numbers and found optimal one
        },
        WEIGHTS: {
            GPA: 0.3,
            SAT: 0.2,
            ACT: 0.2,
            SIMILAR_STUDENTS: 0.3,
        },
        BIAS: { //SMALL AMOUNT FROM AVG TO CHECK BOUNDRIES
            GPA: 0.05,
            SAT: 50,
            ACT: 2,
        }

    }
    //If college doesnt report gpa, remove criteria
    var gpaScore = 0
    if (college.gpa < 0 || userProfile.gpa < 0) {
        removeAndSpreadWeights(QUESTIONABLE_CONSTANTS.WEIGHTS, "GPA")
    } else {
        //GPA -  If the difference between the two is greater than Total, the similarity is just 0.
        gpaScore = calculate_acceptance_score( userProfile.gpa, college.gpa, QUESTIONABLE_CONSTANTS.TOTALS.GPA, 1, QUESTIONABLE_CONSTANTS.BIAS.GPA) //Get full results and multiply by weights later if they change
    }
    var WeightedACT = 0
    if (college.ACT_composite > -1 && userProfile.ACT_composite > -1) {
        WeightedACT = calculate_acceptance_score( userProfile.ACT_composite, college.ACT_composite ,QUESTIONABLE_CONSTANTS.TOTALS.ACT, 1, QUESTIONABLE_CONSTANTS.BIAS.ACT)
    } else {
        //At least one is unreported remove ACT criteria
        removeAndSpreadWeights(QUESTIONABLE_CONSTANTS.WEIGHTS, "ACT")
    }

    var WeightedSAT = 0
    if (college.SAT_EBRW > -1 && userProfile.SAT_EBRW > -1) {
        WeightedSATEBRW = calculate_acceptance_score(userProfile.SAT_EBRW, college.SAT_EBRW , QUESTIONABLE_CONSTANTS.TOTALS.SAT / 2, 0.5, QUESTIONABLE_CONSTANTS.BIAS.SAT/2) //Get full results and multiply by weights later if they change
        WeightedSATMATH = calculate_acceptance_score(userProfile.SAT_math, college.SAT_math , QUESTIONABLE_CONSTANTS.TOTALS.SAT / 2, 0.5, QUESTIONABLE_CONSTANTS.BIAS.SAT/2)
        WeightedSAT = WeightedSATMATH + WeightedSATEBRW
    } else {
        //At least one is unreported remove SAT criteria
        removeAndSpreadWeights(QUESTIONABLE_CONSTANTS.WEIGHTS, "SAT")
    }


    //Check how many similar students were accepted to the school
    var SimilarStudentsScore = 0
    var total = 0
    var numSimStudents = 0
    if (college.acceptanceDecisions.length < 1) {
        removeAndSpreadWeights(QUESTIONABLE_CONSTANTS.WEIGHTS, "SIMILAR_STUDENTS")
    } else {
        //Loop through all acceptance decisions for the college
        for (application in college.applications) {
            if(application.status == true) //If status is accepted then we compute
            {
                let similarScore = determine_Better_Profile(application.student, userProfile)
                if (similarScore > 0.65) {
                    numSimStudents += 1
                }
                total += 1
            }
        }
        //Compare each student to user using determine_Similar_Profiles()
        //numSimStudents = number of students with 75% or more similar profile to the user
        SimilarStudentsScore = numSimStudents / total * QUESTIONABLE_CONSTANTS.WEIGHTS.SIMILAR_STUDENTS
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

    final_score = (gpaScore + WeightedSAT + WeightedACT + SimilarStudentsScore)
    console.log(final_score)
    if (final_score > 0.75)
        return false
    return true
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

//DETERMINES IF PROFILE 1 IS BETTER THAN PROFILE 2
function determine_Better_Profile(profile1, profile2) {
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
    if (profile1.SAT_EBRW > -1 && profile2.SAT_EBRW > -1) { //MAKE SURE IF USER ENTERS ONE SAT_EBRW !! IT MSUT ENTER MATH RESTRICT THIS*********************************
        WeightedSATEBRW = calculate_acceptance_score(profile1.SAT_EBRW , profile2.SAT_EBRW, BETTER_STUDENT_CONSTANTS.TOTALS.SAT / 2, 0.5, BETTER_STUDENT_CONSTANTS.BIAS.SAT/2) //Get full results and multiply by weights later if they change
        WeightedSATMATH = calculate_acceptance_score(profile1.SAT_math , profile2.SAT_math, BETTER_STUDENT_CONSTANTS.TOTALS.SAT / 2, 0.5, BETTER_STUDENT_CONSTANTS.BIAS.SAT/2)
        WeightedSAT = WeightedSATMATH + WeightedSATEBRW
    } else {
        //At least one is unreported remove SAT criteria
        removeAndSpreadWeights(BETTER_STUDENT_CONSTANTS.WEIGHTS, "SAT")
    }

    var WeightedHS = 0
    if (profile1.high_school != null && profile2.high_school != null) {
        WeightedHS = determine_similar_HS_value(profile1.high_school, profile2.high_school)
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

    //console.log(gpaScore, WeightedSAT, WeightedACT, WeightedHS)

    final_score = (gpaScore + WeightedSAT + WeightedACT + WeightedHS)
    return final_score
}





function testHS() {
    var samplehs1 = {
        overallAcademicGrade: "A",
        SAT: 1450,
        ACT: 34,
        graduationRate: 78,
        stateMath: 99,
        stateReading: 99,
    }

    var samplehs2 = {
        overallAcademicGrade: "B+",
        SAT: 1390,
        ACT: 33,
        graduationRate: 78,
        stateMath: 97,
        stateReading: 95,
    }

    var samplehs3 = {
        overallAcademicGrade: "C",
        SAT: 980,
        ACT: 26,
        graduationRate: 78,
        stateMath: 77,
        stateReading: 83,
    }



    console.log("Testing HS similarity - High Score (High similarity HS")
    console.log(determine_similar_HS_value(samplehs1, samplehs2))
    console.log("Testing HS similarity - Low Score (Low Similarity HS")
    console.log(determine_similar_HS_value(samplehs1, samplehs3))

}

function testCollege() {
    var sampleCollege = {
        majors: ["Math"],
        gpa: 3.94,
        ACT_composite: -1,
        SAT_EBRW: 720,
        SAT_math: 780,
        acceptanceDecisions: [], 
    }


    var sampleUserProfile1 = {
        major_1: "Math",
        major_2: "",
        gpa: 3.8666,
        ACT_composite: 29,
        SAT_EBRW: 580,
        SAT_math: 710,
        high_school: null,
    }

    var sampleUserProfile2 = {
        major_1: "Math",
        major_2: "",
        gpa: 3.0,
        ACT_composite: 25,
        SAT_EBRW: 400,
        SAT_math: 400,
        high_school: null,
    }


    console.log("Testing college similarity - High Score (High similarity student")
    console.log(computeCollegeSimilarityScore(sampleCollege, sampleUserProfile1))
    console.log("Testing college similarity - Low Score (Low Similarity student")
    console.log(computeCollegeSimilarityScore(sampleCollege, sampleUserProfile2))

}

function testProfile() {
    var sampleUserProfile = {
        major_1: "Math",
        major_2: "",
        gpa: 3.8666,
        ACT_composite: 32,
        SAT_EBRW: 580,
        SAT_math: 710,
        high_school: null,
    }

    var sampleUserProfile2 = {
        major_1: "Math",
        major_2: "",
        gpa: 3.7,
        ACT_composite: 30,
        SAT_EBRW: 620,
        SAT_math: 590,
        high_school: null,
    }

    var sampleUserProfile3= {
        major_1: "Math",
        major_2: "",
        gpa: 2.8,
        ACT_composite: 27,
        SAT_EBRW: 500,
        SAT_math: 550,
        high_school: null,
    }

    
    console.log("Testing profile to profile similarity - Low Score (Low similarity")
    console.log(determine_Similar_Profile(sampleUserProfile, sampleUserProfile3))
    console.log("Testing profile to profile similarity - High Score (High similarity")
    console.log(determine_Similar_Profile(sampleUserProfile, sampleUserProfile2))
}



function testQuestionableDecisions() {
    var sampleUserProfile = {
        major_1: "Math",
        major_2: "",
        gpa: 3.8666,
        ACT_composite: 32,
        SAT_EBRW: 580,
        SAT_math: 710,
        high_school: null,
    }

    var sampleAcceptanceDecision = {
        college : {
            majors: ["Math"],
            gpa: 3.94,
            ACT_composite: 35,
            SAT_EBRW: 720,
            SAT_math: 780,
            acceptanceDecisions: [],
        },
        student: sampleUserProfile
    }

    var sampleUserProfile2 = {
        major_1: "Math",
        major_2: "",
        gpa: 4.0,
        ACT_composite: 35,
        SAT_EBRW: 700,
        SAT_math: 700,
        high_school: null,
    }


    var sampleUserProfile3 = {
        major_1: "Math",
        major_2: "",
        gpa: 2.7,
        ACT_composite: 24,
        SAT_EBRW: 450,
        SAT_math: 450,
        high_school: null,
    }

    console.log("Testing qusetionable decisions - Lower Averages (Questionable decisions)")
    console.log(detect_Questionable_Decision(sampleAcceptanceDecision, sampleUserProfile3))
    console.log("Testing qusetionable decisions - Higher Averages (Not Questionable decisions)")
    console.log(detect_Questionable_Decision(sampleAcceptanceDecision, sampleUserProfile2))


}

function testBetterProfile() {
    var sampleUserProfile = {
        major_1: "Math",
        major_2: "",
        gpa: 3.8666,
        ACT_composite: 32,
        SAT_EBRW: 580,
        SAT_math: 710,
        high_school: null,
    }

    var sampleUserProfile2 = {
        major_1: "Math",
        major_2: "",
        gpa: 3.5,
        ACT_composite: 27,
        SAT_EBRW: 620,
        SAT_math: 590,
        high_school: null,
    }

    console.log(determine_Better_Profile(sampleUserProfile, sampleUserProfile2))

}

testHS()
testCollege()
testProfile()
testQuestionableDecisions()