'use strict';

// tcp/ip통신을 위한 모듈
const net = require('net'),
      tcpClient = require('./client.js');

/**
  tcpServer 클래스
*/
class tcpServer {

  /**
    생성자
  */
  constructor (name, port, urls) {
    this.logTcpClient = null; // 로그 관리 마이크로서비스 연결 클라이언트

    // 서버정보
    this.context = {
      port: port,
      name: name,
      urls: urls
    };
    this.merge = {};  // client에서 데이터수신 처리 시 사용

    // 서버생성
    this.server = net.createServer((socket) => {
      this.onCreate(socket);

      // 에러 이벤트 처리
      socket.on('error', (exception) => {
        this.onClose(socket);
      });

      // 클라이언트 접속종료 이벤트 처리
      socket.on('close', () => {
        this.onClose(socket);
      });

      // 데이터수신 처리
      socket.on('data', (data) => {
        let key = socket.remoteAddress + ':' + socket.remotePort;
        let sz = this.merge[key] ? this.merge[key] + data.toString() : data.toString();
        let arr = sz.split('¶');
        for (let n in arr) {
          if (sz.charAt(sz.length - 1) != '¶' && n == arr.length - 1) {
            this.merge[key] = arr[n];
            break;
          } else if (arr[n] == "") {
            break;
          } else {
            this.writeLog(arr[n]);
            this.onRead(socket, JSON.parse(arr[n]));
          }
        }
      });
    });

    // 서버객체 에러처리
    this.server.on('error', (err) => {
      console.log(err);
    });

    // listen
    this.server.listen(port, () => {
      console.log('listen', this.server.address());
    });
  } // END constructor

  /**
    서버 생성
  */
  onCreate (socket) {
    console.log('onCreate', socket.remoteAddress, socket.remotePort);
  }

  /**
    클라이언트 접속종료
  */
  onClose (socket) {
    console.log('onClose', socket.remoteAddress, socket.remotePort);
  }

  // Distributor 접속
  connectToDistributor (host, port, onNoti) {
    var packet = {  // distributor로 전달할 현재 마이크로서비스 정보
      uri: '/distributes',
      method: 'POST',
      key: 0,
      params: this.context
    };
    let isConnectedDistributor = false;

    this.clientDistributor = new tcpClient(
      host,
      port,
      (options) => {  // onCreate
        isConnectedDistributor = true;
        this.clientDistributor.write(packet);
      },
      (options, data) => {  // onRead
        // 로그 관리 마이크로서비스 연결
        if (this.logTcpClient == null && this.context.name != 'logs') {
          for (let n in data.params) {
            const ms = data.params[n];
            if (ms.name == 'logs') {
              this.connectToLog(ms.host, ms.port);
              break;
            }
          }
        }

        onNoti(data);
      },
      (options) => { isConnectedDistributor = false; }, // onEnd
      (options) => { isConnectedDistributor = false; }  // onError
    );

    // 주기적인 Distributor 접속시도(3초)
    setInterval(() => {
      if (!isConnectedDistributor) {
        this.clientDistributor.connect();
      }
    }, 3000)
  }

  // 로그관리 마이크로서비스 연결
  connectToLog (host, port) {
    this.logTcpClient = new tcpClient(host, port
      , (options) => {} // onCreate
      , (options) => { this.logTcpClient = null; } // onRead
      , (options) => { this.logTcpClient = null; } // onEnd
    );
    this.logTcpClient.connect();
  }

  // Log 패킷 전달
  writeLog (log) {
    if (this.logTcpClient) {
      const packet = {
        uri: '/logs',
        method: 'POST',
        key: 0,
        params: log
      };
      this.logTcpClient.write(packet);
    } else {
      console.log(log);
    }
  }
}

module.exports = tcpServer; // export 선언
