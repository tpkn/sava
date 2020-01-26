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
         max_errors_streak = 15, 
         body_size = 0,
         dev = false,
      } = options;

      this.aid;
      this.url = url;
      this.timeout = timeout * 1000;
      this.interval = interval * 1000;
      this.max_errors_streak = max_errors_streak;
      this.body_size = body_size;
      this.errors_streak = 0;

      if(typeof messages === 'undefined'){
         this.messages = {
            OK              : 'Works as expected',
            TIMEOUT         : 'Server does not respond',
            NOT_FOUND       : 'Wrong url',
            WRONG_BODY_SIZE : 'Wrong response body size: %s bytes',
         }
      }else{
         this.messages = messages;
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
         let date = this.date();
         let status = 'ok';
         let message = this.messages.OK;
         let delay = Date.now() - time;
         let size;

         if(err){
            status = 'error';
            if(err.message.indexOf('ETIMEDOUT') != -1){
               message = this.messages.TIMEOUT;
            }else if(err.message.indexOf('ENOTFOUND') != -1){
               message = this.messages.NOT_FOUND;
            }else{
               message = err.message;
            }
         }else{
            let res_body_size = body.length;

            if(res.statusCode !== 200){
               status = 'error';
            }

            if(res_body_size !== this.body_size){
               status = 'error';
               message = this.messages.WRONG_BODY_SIZE.replace('%s', res_body_size);
               size = res_body_size;
            }
         }

         if(status == 'error'){
            this.errors_streak++;
            if(this.errors_streak == this.max_errors_streak){
               this.emit('alarm', { message });
            }
         }else{
            // Clear errors streak
            this.errors_streak = 0;
         }

         // Emit result as event
         this.emit('update', { date, status, message, delay, size });
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

   date(){
      let date = (new Date).toISOString();
      return date.substr(0,10) + ' ' + date.substr(11,8);
   }
}

module.exports = Sava;
