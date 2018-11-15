const conf = require('../conf/config').setting,
      mongoose = require('mongoose'),
      Issue = require('../models/Issue');

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb+srv://gijoona:mongodb77@cluster-quester-euzkr.gcp.mongodb.net/quester', { promiseLibrary: require('bluebird') })
        .then(() => console.log('connection successful!!!'))
        .catch((err) => console.error(err));

const redis = require('redis').createClient(conf.redis.port, conf.redis.ip);  // redis 모듈 로드
redis.on('error', (err) => {
  console.log(`Redis Error ${err}`);
});

exports.onRequest = function (res, method, pathname, params, cb) {
  // 메서드별로 기능 분기
  switch (method) {
    case 'POST':
      return register(method, pathname, params, (response) => {
        process.nextTick(cb, res, response);;
      });
    case 'GET':
      return inquiry(method, pathname, params, (response) => {
        process.nextTick(cb, res, response);;
      });
    case 'PUT':
      return modify(method, pathname, params, (response) => {
        process.nextTick(cb, res, response);;
      });
    case 'DELETE':
      return unregister(method, pathname, params, (response) => {
        process.nextTick(cb, res, response);;
      });
    default:
      // 정의되지 않은 메서드면 null return
      return process.nextTick(cb, res, null);
  }
}

function register (method, pathname, params, cb) {
  let parameters = params.data,
      response = {
        key: params.key,
        errorcode: 0,
        errormessage: 'success'
      };

  // TODO :: 실제 register 로직
  cb(response);
}

function modify (method, pathname, params, cb) {
  let parameters = params.data,
      response = {
        key: params.key,
        errorcode: 0,
        errormessage: 'success'
      };

  // TODO :: 실제 modify 로직
  cb(response);
}

function inquiry (method, pathname, params, cb) {
  let parameters = params.data,
      response = {
        key: params.key,
        errorcode: 0,
        errormessage: 'success'
      };

  // TODO :: 실제 inquiry 로직
  cb(response);
}

function unregister (method, pathname, params, cb) {
  let parameters = params.data,
      response = {
        key: params.key,
        errorcode: 0,
        errormessage: 'success'
      };

  // TODO :: 실제 unregister 로직
  cb(response);
}
