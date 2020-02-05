/**
 * Sava, http://tpkn.me/
 */
const request = require('request');
const EventEmitter = require('events');

class Sava extends EventEmitter {
   constructor(options){
      super();

      let { 
         url, 
         timeout = 10, 
         interval = 60, 
         messages,
         max_ping = 0,
         max_errors_streak = 15, 
         body_size = 0,
         dev = false,
      } = options;

      this.aid;
      this.url = url;
      this.timeout = timeout * 1000;
      this.interval = interval * 1000;
      this.max_ping = max_ping;
      this.max_errors_streak = max_errors_streak;
      this.body_size = body_size;
      this.errors_streak = 0;

      // Status details
      this.messages = {
         timeout: 'Server does not respond',
         not_found: 'Wrong url',
         high_ping: 'Ping is %s ms above the maximum',
         wrong_body_size: 'Wrong response body size: %s bytes',
      }

      if(messages === Object(messages)){
         this.messages = Object.assign(this.messages, messages);
      }
      
      if(dev){
         console.log(' ___    __  _  _  __   ');
         console.log('/ __)  /__\\( \\/ )/__\\  ');
         console.log('\\__ \\ /(__)\\\\  //(__)\\ ');
         console.log('(___/(__)(__)\\/(__)(__)');
         console.log('');
         console.log('URL:               ' + url);
         console.log('TIMEOUT:           ' + timeout, 'sec');
         console.log('INTERVAL:          ' + interval, 'sec');
         console.log('MAX ERRORS STREAK: ' + max_errors_streak);
         console.log('');
      }
   }

   check(){
      let time = Date.now();

      request({ url: this.url, encoding: null, timeout: this.timeout }, (err, res, body) => {
         let date = this.datetime();
         let status = 'ok';
         let details = [];
         let ping = Date.now() - time;
         let size;

         if(err){
            status = 'error';
            if(err.message.indexOf('ETIMEDOUT') != -1){
               details.push(this.messages.timeout);
            }else if(err.message.indexOf('ENOTFOUND') != -1){
               details.push(this.messages.not_found);
            }else{
               details.push(err.message);
            }
         }else{
            let res_body_size = body.length;

            // Server error
            if(res.statusCode !== 200){
               status = 'error';
            }

            // Partial response body
            if(res_body_size !== this.body_size){
               status = 'error';
               details.push(this.messages.wrong_body_size.replace('%s', res_body_size));
               size = res_body_size;
            }

            // High ping warning
            if(this.max_ping > 0 && ping > this.max_ping){
               status = 'error';
               details.push(this.messages.high_ping.replace('%s', ping - this.max_ping));
               size = res_body_size;
            }
         }

         if(status == 'error'){
            this.errors_streak++;
            if(this.errors_streak == this.max_errors_streak){
               this.emit('alarm', { details });
            }
         }else{
            // Clear errors streak
            this.errors_streak = 0;
         }


         // Emit result
         this.emit('update', { date, status, details, ping, size });

      });
   }

   schedule(){
      clearInterval(this.aid);
      this.aid = setInterval(this.check.bind(this), this.interval);
      this.check();
   }

   stop(){
      clearInterval(this.aid);
   }

   datetime(){
      let date = (new Date).toISOString();
      return date.substr(0,10) + ' ' + date.substr(11,8);
   }
}

module.exports = Sava;
