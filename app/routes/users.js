'use strict';

exports.index = (req, res)=>{
  res.render('users/index', {title: 'Dashboard'});
};
