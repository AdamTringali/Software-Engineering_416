/**
 * PUT CONSTANTS IN HERE
 */
export const port = "http://35.224.128.175"
//export const port = "http://localhost:3001";

export const selectRow = {
  mode: 'radio',
  clickToSelect: true,
  clickToEdit: true
};

export const selectRow_loc = {
  mode: 'checkbox',
  clickToSelect: true,
};

export const application_columns = [{
  dataField: 'collegeName',
  text: 'College Name',
  sort: true,
  editable: false
}, {
  dataField: 'status',
  text: 'Status',
  sort: true
}
];

export const student_columns = [{
  dataField: 'userid',
  text: 'Userid',
  sort: true,
  editable: false

}, {
  dataField: 'status',
  text: 'Status',
  sort: true
}, {
  dataField: 'college_class',
  text: 'College Class',
  sort: true
}, {
  dataField: 'high_school_name',
  text: 'High school',
  sort: true
}
];

export const review_student_columns = [{
  dataField: 'userid',
  text: 'Userid',
  sort: true,
  editable: false

}, {
  dataField: 'status',
  text: 'Status',
  sort: true
},{
  dataField: 'college',
  text: 'College Name',
  sort: true
}
];

export const loc_columns = [{
  dataField: 'loc',
  text: 'Regions',
}
];

export const locations = [
  {
    loc: "Northeast"
  }, {
    loc: "Midwest"
  }, {
    loc: "South"
  }, {
    loc: "West"
  }];

export const profile_columns = [
  {
    dataField: 'userid',
    text: 'User ID',
    sort: true
  }, {
    dataField: '_id',
    text: '_id',
    sort: true
  }];

export const defaultSorted = [{
  dataField: 'similarScore',
  order: 'desc'
}];

export const defaultSorted_apps = [{
  dataField: 'status',
  order: 'asc'
}];

export const defaultSorted_hs = [{
  dataField: 'similarScore',
  order: 'desc'
}];

export const highschool_columns = [{
  dataField: 'name',
  text: 'High School Name',
  sort: true,
  hidden: false
}, {
  dataField: 'AcademicGrade',
  text: 'Academic Grade',
  sort: true,
  hidden: false
}, {
  dataField: 'graduationRate',
  text: 'Graduation Rate',
  sort: true,
  hidden: false
}, {
  dataField: 'city',
  text: 'City',
  sort: true,
  hidden: true
}, {
  dataField: 'state',
  text: 'State',
  sort: true,
  hidden: false
}, {
  dataField: 'SAT_Composite',
  text: 'SAT_Composite',
  sort: true,
  hidden: true
}, {
  dataField: 'ACT_Composite',
  text: 'ACT_Composite',
  sort: true,
  hidden: true    
}, {
  dataField: 'stateMath',
  text: 'State Math',
  sort: true,
  hidden: true

}, {
  dataField: 'stateReading',
  text: 'State Reading',
  sort: true,
  hidden: true
}, {
  dataField: 'APpassRate',
  text: 'AP Pass Rate',
  sort: true,
  hidden: true
}, {
  dataField: 'similarScore',
  text: 'Similarity Score',
  sort: true,
  hidden: false
}];

export const app_status = [
 { value: 0, 
  label: "Accepted"
},
{ value: 1, 
  label: "Pending"
},
{ value: 2, 
  label: "Denied"
},
{ value: 3, 
  label: "Deferred"
},
{ value: 4, 
  label: "Wait-listed"
},
{ value: 5, 
  label: "Withdrawn"
}];