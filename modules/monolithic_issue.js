const conf = require('../conf/config').setting,
      mongoose = require('mongoose'),
      Issue = require('../models/Issue');

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb+srv://gijoona:mongodb77@cluster-quester-euzkr.gcp.mongodb.net/quester', { useNewUrlParser: true, promiseLibrary: require('bluebird') })
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
  let newIssue = new Issue({
    title: parameters.title,
    contents: parameters.contents,
    solutions: parameters.solutions,
    tags: parameters.tags,
    state: parameters.state
  });
  newIssue.save(function (err, issueDoc) {
    if (err) {
      console.error(err);
      response.errorcode = 1;
      response.errormessage = err;
      cb(response);
    } else if(issueDoc) {
      cb(response);
    } else {
      response.errorcode = 1;
      response.errormessage = 'Save failed';
      cb(response);
    }
  });
}

function modify (method, pathname, params, cb) {
  let parameters = params.data,
      response = {
        key: params.key,
        errorcode: 0,
        errormessage: 'success'
      };

  // TODO :: 실제 modify 로직
  parameters.isAnswer = (parameters.solutions || '') == '' ? false : true;
  Issue.findByIdAndUpdate(parameters._id, parameters, { new: true })
    .then(function (issueDoc) {
      if (issueDoc) {
        response.results = issueDoc;
        cb(response);
      } else {
        response.errorcode = 1;
        response.errormessage = 'Modify failed';
        cb(response);
      }
    })
    .catch(function (err) {
      response.errorcode = 1;
      response.errormessage = err;
      cb(response);
    });
}

function inquiry (method, pathname, params, cb) {
  let parameters = params.data,
      searchData = {},
      response = {
        key: params.key,
        errorcode: 0,
        errormessage: 'success'
      };

  // TODO :: 실제 inquiry 로직
  if (pathname === '/issue/hashinfo') {
    // TODO :: 해시태그 검색 결과가 2번씩 날아가서 오류가 발생하고 있음. 확인필요
    searchData['$elemMatch'] = { tags: '#' + parameters.hashtag };
    Issue.find(searchData, function (err, issueDoc) {
      if (err) {
        response.errorcode = 1;
        response.errormessage = err;
        cb(response);
      } else if (issueDoc) {
        response.results = issueDoc;
        cb(response);
      } else {
        response.errorcode = 1;
        response.errormessage = 'no data';
        cb(response);
      }
    });
  } else if (pathname === '/issue/edit') {
    searchData.seq = parameters.id;
    Issue.findOne(searchData, function (err, issueDoc) {
      if (err) {
        response.errorcode = 1;
        response.errormessage = err;
        cb(response);
      } else if (issueDoc) {
        response.results = issueDoc;
        cb(response);
      } else {
        response.errorcode = 1;
        response.errormessage = 'no data';
        cb(response);
      }
    });
  } else if (pathname === '/issue/list') {
    if (parameters.search) {
      searchData['$or'] = [];
      searchData['$or'].push({title: {$regex: parameters.search, $options: 'i'}});
      searchData['$or'].push({contents: {$regex: parameters.search, $options: 'i'}});
      searchData['$or'].push({solutions: {$regex: parameters.search, $options: 'i'}});
    }
    Issue.find(searchData, 'title seq state isAnswer inputDt', function (err, issueDoc) {
      if (err) {
        response.errorcode = 1;
        response.errormessage = err;
        console.error(err);
        cb(response);
      } else if (issueDoc) {
        response.results = issueDoc;
        cb(response);
      } else {
        response.errorcode = 1;
        response.errormessage = 'no data';
        cb(response);
      }
    }).sort({inputDt: 'desc'});
  }
}

function unregister (method, pathname, params, cb) {
  let parameters = params.data,
      response = {
        key: params.key,
        errorcode: 0,
        errormessage: 'success'
      };

  // TODO :: 실제 unregister 로직
  Issue.findOneAndDelete({ seq: parameters.id }, function (err, result) {
    if (err) {
      response.errorcode = 1;
      response.errormessage = err;
      cb(response);
    } else if (result) {
      response.results = result;
      cb(response);
    } else {
      response.errorcode = 1;
      response.erroemessage = 'Delete failed';
      cb(response);
    }
  });
}
