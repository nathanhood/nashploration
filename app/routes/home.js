'use strict';

exports.index = (req, res)=>{
  res.render('home/index', {title: 'Nashploration', registerAndLogin: req.flash('registerAndLogin')});
};

exports.confirmation = (req, res)=>{
  if (req.params.groupCode) {
    var groupCode = req.params.groupCode;
    res.render('home/confirmation', {title: 'Nashploration', code:groupCode});
  }
};
