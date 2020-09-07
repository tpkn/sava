/**
 * Sava, http://tpkn.me/
 */
const fs = require('fs');
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
      this.cache_file = './.cache';

      // Load cached file size
      if(!body_size && fs.existsSync(this.cache_file)){
         this.body_size = fs.readFileSync(this.cache_file, 'utf8');
         console.log(this.body_size);
      }


      // Status details
      this.messages = {
         timeout: 'Server does not respond',
         not_found: 'Wrong url',
         high_ping: 'Ping is %s ms above the maximum',
         wrong_body_size: 'Wrong response body size: %s bytes',
         init_failed: 'Initialization failed, the file is not available'
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
         console.log('url:               ' + url);
         console.log('timeout:           ' + timeout, 'sec');
         console.log('interval:          ' + interval, 'sec');
         console.log('max errors streak: ' + max_errors_streak);
         console.log('');
      }
   }

   init(){
      request({ url: this.url, encoding: null, timeout: this.timeout }, (err, res, body) => {
         if(err){
            this.emit('error', { message: this.messages.init_failed });
            return
         }

         this.body_size = body.length;
         fs.writeFileSync(this.cache_file, this.body_size, { flag: 'w' });

         this.emit('init', { size: this.body_size });
      })
   }

   check(){
      let time = Date.now();

      request({ url: this.url, encoding: null, timeout: this.timeout }, (err, res, body) => {
         let date = this._datetime();
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

   _datetime(){
      let date = (new Date).toISOString();
      return date.substr(0,10) + ' ' + date.substr(11,8);
   }
}

module.exports = Sava;
