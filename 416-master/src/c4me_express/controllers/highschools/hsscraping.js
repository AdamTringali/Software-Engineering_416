//High School SCraping
let axios = require('axios');
let cheerio = require('cheerio');

url = "http://allv22.all.cs.stonybrook.edu/~stoller/cse416/niche/academy-for-information-technology-scotch-plains-nj/"

const html = 0
//Axios gets the url
axios.get(url)
    .then((response) => {
        //If recived ok response load the html
        if (response.status === 200) {
            const html = response.data; //Gets html data from url
            const $ = cheerio.load(html); //Converts data (removes $ tags)

            let hs_info = {
                AcademicGrade: -1, //Scrape
                SAT_Composite: -1, //Scrape
                ACT_Composite: -1, //Scrape
                graduationRate: -1, //Scrape
                stateMath: -1, //Scrape
                stateReading: -1, //Scrape
                APpassRate: -1

            }
            var indexI = -1
            var indexI2 = -1
            nicheGradeIndex = -1


            $('.blank__bucket').each(function (i, elem) {

                //console.log($(this).text())
                $(this).find('.scalar__label').each(function (j, elem) //For each child in this list
                    {
                        if ($(this).find('span').text().trim() == "Average Graduation Rate") //
                        {
                            indexI = i
                        }
                        if ($(this).find('span').text().trim() == "Percent Proficient - Reading") //
                        {
                            indexI2 = i
                        }
                    });


                if (i == indexI) //When at correct DOM indices store info into collegeinfo dict object
                {
                    $(this).find('.scalar__value').each(function (j, elem) //For each child in this list
                        {
                            var element_info = $(this)
                                .clone() //clone the element
                                .children() //select all the children
                                .remove() //remove all the children
                                .end() //again go back to selected element
                                .text(); //get the text of element

                            $(this).find('span').each(function (j, elem) //
                                {
                                    element_info = $(this).text()
                                });

                            switch (j) //Scraped in order of website [gradrate, sat, act, ap]
                            {
                                case 0:
                                    hs_info.graduationRate = element_info
                                    break
                                case 1:
                                    hs_info.SAT_Composite = element_info
                                    break
                                case 2:
                                    hs_info.ACT_Composite = element_info
                                    break
                                case 3:
                                    hs_info.APpassRate = element_info
                                    break
                            }
                        });
                }
                if (i == indexI2) //When at correct DOM indices store info into collegeinfo dict object
                {
                    $(this).find('.scalar__value').each(function (j, elem) //For each child in this list
                        {
                            $(this).find('span').each(function (k, elem) //
                                {
                                    element_info = $(this).text()
                                    hs_info.stateReading = element_info

                                });                            
                        });
                }
                if (i == indexI2+1) //When at correct DOM indices store info into collegeinfo dict object
                {
                    $(this).find('.scalar__value').each(function (j, elem) //For each child in this list
                        {
                            $(this).find('span').each(function (k, elem) //
                                {
                                    element_info = $(this).text()
                                    hs_info.stateMath = element_info
                                });                            
                        });
                }
            });

            $('.profile-grade--two').each(function (i, elem) {

                //console.log($(this).text())
                $(this).find('div').each(function (j, elem) //For each child in this list
                    {
                        if($(this).text().trim() == "Academics") //
                        {
                            nicheGradeIndex = i
                        }
                    });
                if(nicheGradeIndex == i) //If previous div tag was "Academics"
                {
                    $(this).find('div').each(function (j, elem) //For each child in this list
                    {
                        if (j == 1) //
                        {
                            hs_info.AcademicGrade = $(this).text()
                        }
                    });
                }
               
            });
            console.log(hs_info)
        }
        //Else print error
    }, (error) => console.log("error"));