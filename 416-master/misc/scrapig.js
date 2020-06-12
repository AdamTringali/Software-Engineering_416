let axios = require('axios');
let cheerio = require('cheerio');

url = "http://allv22.all.cs.stonybrook.edu/~stoller/cse416/collegedata/Stony-Brook-University/"

url2= "https://www.collegedata.com/college/Stony-Brook-University"

url3 = "https://www.collegedata.com/college/Stony-Brook-University/?tab=profile-academics-tab"

const html = 0
//Axios gets the url
axios.get(url)
    .then((response) => {
        //If recived ok response load the html
        if (response.status === 200) {
            const html = response.data; //Gets html data from url
            const $ = cheerio.load(html); //Converts data (removes $ tags)
            
            let college_info = {
                costInState: -1,//Scrape
                costOutState: -1,//Scrape
                avgGpa: -1,//Scrape
                SAT_math: -1, //Scrape
                SAT_EBRW: -1, //Scrape
                ACT_Composite: -1, //Scrape
                completionRate: -1, //Scrape
                majors: [], //Scrape

            }
            var SATMathIndexI = -1
            var SATMathIndexJ = -1
            var SATEBRWIndexI = -1
            var SATEBRWIndexJ = -1
            var ACTIndexI = -1
            var ACTIndexJ = -1
            var GPAIndexI = -1
            var GPAIndexJ = -1
            var costIndexI = -1
            var costIndexJ = -1

            var majorIndexI = -1
            var majorIndexJ = -1
            var gradRateIndexI = -1
            var gradRateIndexJ = -1

            $('.card-body').each(function(i, elem)
            {

                $(this).children('h3').each(function(j, elem) //For each child in this list
                {
                    
                    if($(this).text().trim() == "Undergraduate Majors")//Find  a strong that matches Undergraduate Majors
                    {
                        majorIndexI = i
                        majorIndexJ = j+1 //Store indcides of the tag with the corresponding info (j+1)
                    }
                });
                
                if(i == majorIndexI)//When at correct DOM indices store info into collegeinfo dict object
                {
                    $(this).children().each(function(j, elem)
                    {
                      $(this).children(".col-sm-6").each(function(j, elem) //For each child in this list
                            {               
                                $(this).find('ul').children().each(function(j, elem)
                                {
                                    college_info.majors.push($(this).text())
                                });
                            });
                    
                    });
                }
            });

            

            $('.dl-split-sm').each(function(i, elem) { //For each of these classes
                $(this).children().each(function(j, elem) //For each child in this list
                {
                    if($(this).find('strong').text().trim() == "SAT Math")//Find  a strong that matches SAT MATH
                    {
               
                    }
                    if($(this).find('strong').text().trim() == "SAT EBRW")
                    {
                    }
                });
                $(this).children('dt').each(function(j, elem) //For each dt child in this list
                {
                    //console.log(j , $(this).text())
                    if($(this).text().trim() == "ACT Composite")//If dt tag text match "ACT Composite we store those indices"
                    {
                        ACTIndexI = i
                        ACTIndexJ = j
                    }
                    if($(this).text().trim() == "Average GPA")
                    {
                        GPAIndexI = i
                        GPAIndexJ = j
                    }
                    if($(this).text().trim() == "Cost of Attendance")
                    {
                        costIndexI = i
                        costIndexJ = j
                    }
                    if($(this).text().trim() == "Students Graduating Within 4 Years")
                    {
                        gradRateIndexI = i
                        gradRateIndexJ = j
                    }
                    if($(this).text().trim() == "SAT Math")//If dt tag text match "ACT Composite we store those indices"
                    {
                        SATMathIndexI = i
                        SATMathIndexJ = j //Store indcides of the tag with the corresponding info (j+1)
                    }
                    if($(this).text().trim() == "SAT EBRW")//If dt tag text match "ACT Composite we store those indices"
                    {
                        SATEBRWIndexI = i
                        SATEBRWIndexJ = j
                    }
                });

                if(i == SATMathIndexI)//When at correct DOM indices store info into collegeinfo dict object
                {
                    $(this).children('dd').each(function(j, elem) //For each dt child in this list
                    {
                        if(j == SATMathIndexJ)
                            college_info.SAT_math = $(this).text().trim()
                    });
                }
                if(i == SATEBRWIndexI)
                {
                    $(this).children('dd').each(function(j, elem)
                    {
                        if(j == SATEBRWIndexJ)
                        {
                            college_info.SAT_EBRW = $(this).text().trim()
                        }
                    });
                }
                if(i == ACTIndexI)
                {
                    $(this).children('dd').each(function(j, elem)
                    {
                        if(j == ACTIndexJ)
                        {
                            college_info.ACT_Composite = $(this).text().trim()
                        }
                    });
                }
                if(i == GPAIndexI)
                {
                    $(this).children('dd').each(function(j, elem)
                    {
                        if(j == GPAIndexJ)
                        {
                            college_info.avgGpa = $(this).text().trim()
                        }
                    });
                }
                if(i == costIndexI)//When at correct DOM indices store info into collegeinfo dict object
                {
                    $(this).children('dd').each(function(j, elem)
                    {
                        if(j == costIndexJ)
                        {
                            college_info.costInState = $(this).text().trim()
                            college_info.costOutState = $(this).text().trim()
                        }
                    });
                }    
                if(i == gradRateIndexI)//When at correct DOM indices store info into collegeinfo dict object
                {
                    $(this).children('dd').each(function(j, elem)
                    {
                        if(j == gradRateIndexJ)
                        {
                            college_info.completionRate = $(this).text().trim()
                        }
                    });
                }              
            });

            console.log(college_info)
        }
        //Else print error
    }, (error) => console.log(err));
