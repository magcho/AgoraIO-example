<template>
  <v-app :class="text.lang">
    <!-- title bar -->
    <v-toolbar dark color="primary">
      <v-toolbar-title>{{text.toolbar_title}}</v-toolbar-title>
      <a href="https://github.com/AgoraIO/Tools/tree/master/TroubleShooting/Agora-WebRTC-Troubleshooting" class="aperture">
      <span class="github"></span>
      </a>
      <v-spacer></v-spacer>
      <v-btn v-on:click="switchLanguage" color="blue" :disabled="languageDisabled">
        {{text.language}}
      </v-btn>
      <!-- <v-btn disabled flat icon>
        <v-icon>{{text.build}}</v-icon>
      </v-btn> -->
      <v-btn v-if="!testing" color="success" @click.native="start">
        {{text.start_text}}
      </v-btn>
      <v-btn v-else color="error" disabled>
        {{text.running}}
      </v-btn>
    </v-toolbar>
    <!-- end -->
    <v-content>
      <v-container fill-height>
        <v-layout row wrap fill-height>
          <!-- start page -->
          <v-flex md6 offset-md3 v-if="currentTestSuite < 0">
            <v-card style="margin-top: 60px">
              <v-card-title>
                <div class="headline">
                  {{text.following_step}}
                </div>
              </v-card-title>
              <v-card-text>
                <v-btn v-if="!testing" color="success" @click.native="start">
                  {{text.start_text}}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-flex>
          <!-- result page -->
          <v-flex md6 offset-md3 v-else-if="currentTestSuite > 4">
            <v-card style="margin-top: 60px">
              <v-toolbar color="info" dark>
                <v-toolbar-title>
                  {{text.test_report}}
                </v-toolbar-title>
              </v-toolbar>
              <v-list>
                <v-list-item v-for="item in testSuites" :key="item.id">                  
                  <v-list-tile>
                    <v-icon v-if="item.notError" color="success">done</v-icon>
                    <v-icon v-else color="error">close</v-icon>
                    <span>{{t(item.label)}}</span>
                  </v-list-tile>
                  <v-list-content class="result-content">
                    <v-list-tile-content v-html="item.extra"></v-list-tile-content>
                  </v-list-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-flex>
          <!-- test suites -->
          <v-flex v-else>
            <v-stepper v-model="currentTestSuite">
              <v-stepper-header>
                <v-stepper-step
                  v-for="item in testSuites"
                  :key="item.id" :step="item.id"
                  :complete="item.complete || (currentTestSuite > item.id)"
                  :rules="[() => item.notError]">
                  {{t(item.label)}}
                </v-stepper-step>
              </v-stepper-header>

              <v-stepper-items style="background: #EEE">
                <!-- browser check -->
                <v-stepper-content step="0">
                  <v-container grid-list-md>
                    <v-layout row wrap>
                      <v-flex md6 xs12>
                        <v-card style="height: 100%" color="info" class="white--text">
                          <v-card-title>
                            <div class="headline">
                              {{text.browser_check}}
                            </div>
                          </v-card-title>
                          <v-card-text>
                            {{text.support_desc}}
                          </v-card-text>
                        </v-card>
                      </v-flex>
                      <v-flex md6 xs12>
                        <v-card style="height: 100%">
                          <v-card-title>
                            {{text.checking}} {{browserInfo}}
                          </v-card-title>
                          <v-card-text>
                            <v-progress-linear :indeterminate="true"></v-progress-linear>
                          </v-card-text>
                        </v-card>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-stepper-content>
              </v-stepper-items>

              <!-- connection check -->
              <v-stepper-content step="1">
                <v-container grid-list-md>
                  <v-layout row wrap>
                    <v-flex md12>
                      <v-card >
                        <v-card-title>
                          <div>{{text.network_check_desc}}</div>
                        </v-card-title>
                        <v-card-text v-if="renderChart">
                          <v-layout row wrap>
                            <v-flex md6 xs12>
                              <linechart :grid="grid" :data="bitrateData" :settings="bitrateChartSettings"></linechart>
                            </v-flex>
                            <v-flex md6 xs12>
                              <linechart :grid="grid" :data="packetsData" :settings="packetsChartSettings"></linechart>
                            </v-flex>
                          </v-layout>
                        </v-card-text>
                      </v-card>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-stepper-content>

              <!-- rtm check -->              
              <v-stepper-content step="2">
                <v-container grid-list-md>
                  <v-layout row wrap>
                     <v-flex md6 xs12>
                      <v-card style="height: 100%" color="info" class="white--text">
                        <v-card-title>
                          <div class="headline">
                            RTM(normal) check
                          </div>
                        </v-card-title>
                        <v-card-text>
                          {{text.support_desc}}
                        </v-card-text>
                      </v-card>
                    </v-flex>
                    <v-flex md6 xs12>
                      <v-card>
                        <v-card-text>
                          <p>RTM connection testing...</p>
                        </v-card-text>
                        <v-card-text>
                          <v-progress-linear :indeterminate="true"></v-progress-linear>
                        </v-card-text>
                      </v-card>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-stepper-content>

              <!-- rtm check -->
              <v-stepper-content step="3">
                <v-container grid-list-md>
                  <v-layout row wrap>
                    <v-flex md6 xs12>
                      <v-card style="height: 100%" color="info" class="white--text">
                        <v-card-title>
                          <div class="headline">
                            RTM(proxy) check
                          </div>
                        </v-card-title>
                        <v-card-text>
                          {{text.support_desc}}
                        </v-card-text>
                      </v-card>
                    </v-flex>
                    <v-flex md6 xs12>
                      <v-card>
                        <v-card-text>
                          <p>RTM connection testing...</p>
                        </v-card-text>
                        <v-card-text>
                          <v-progress-linear :indeterminate="true"></v-progress-linear>
                        </v-card-text>
                      </v-card>
                    </v-flex>
                  </v-layout>
                </v-container> 
              </v-stepper-content>
            </v-stepper>
            
            <!-- test area -->
            <div id="test-send"></div>
            <div id="test-recv"></div>
          </v-flex>
          <!-- snackbar -->
          <v-snackbar
            v-model="snackbar"
            color="info"
            :timeout="0"
            >
            {{text.notice}}
            <v-btn
              dark
              flat
              @click="haveATry"
            >
              {{text.yes}}
            </v-btn>
            <v-btn
              dark
              flat
              @click="snackbar = false"
            >
              {{text.no}}
            </v-btn>
          </v-snackbar>
          <!-- dialog -->
          <v-dialog v-model="dialog" persistent max-width="360">
            <v-card>
              <v-card-title>
                <v-tabs>
                  <v-tab
                    v-for="(item, index) in ProfileForTry"
                    @click="retry(index)"
                    :key="index"
                  >
                    {{item.resolution}}
                  </v-tab>
                </v-tabs>
              </v-card-title>
              <v-card-text>
                <div id="modal-video" v-if="!errMsgForTry">
                  <div v-if="!showVideo">{{text.videoText}}</div>
                </div>
                <div v-else>{{errMsgForTry}}</div>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green darken-1" flat @click.native="endTry">{{text.close}}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-layout>
      </v-container>
    </v-content>
    
    <v-footer app height="auto">
      <v-card
        class="flex"
        flat
        tile
        color="grey lighten-5"
      >
        <v-card-text style="text-align:right">SDK {{text.Version}}: {{sdkVersion}}</v-card-text>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script>
import AgoraRtc from 'agora-rtc-sdk-ng'
const langs = ['zh', 'en'];
import { profileArray, APP_ID as DEFINED_APP_ID, APP_ID } from "./utils/settings";
import * as i18n from './utils/i18n'
import AgoraRtm from 'agora-rtm-sdk'

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

export default {
  name: "App",
  components: {
    linechart: () => import("./components/linechart.vue")
  },
  mounted() {
    document.title = this.text.toolbar_title
  },
  data() {
    return {
      grid: {
        left: 50
      },
      languageDisabled: false,
      browserInfo: navigator.appVersion || "Current Browser",
      language: navigator.language.match(/^zh/) ? 0 : 1,
      sdkVersion: AgoraRtc.VERSION,
      snackbar: false,
      showVideo: false,
      dialog: false,
      currentTestSuite: "-1",
      inputVolume: 0,
      renderChart: false,
      testing: false,
      isEnableCloudProxy: false,
      fixProxyPort: false,
      profiles: profileArray.map(item => {
        item.status = "pending";
        return item;
      }),
      testSuites: [
        {
          id: "0",
          label: "browser_compatibility",
          notError: true,
          extra: ""
        },
        {
          id: "2",
          label: "connection",
          notError: true,
          extra: ""
        },
        {
          id: "3",
          label: 'rtm_disable_proxy',
          notError: true,
          extra:''
        },
        {
          id: "4",
          label: 'rtm_enable_proxy',
          notError: true,
          extra:''
        },
      ],
      bitrateData: {
          columns: ['index', 'tVideoBitrate', 'tAudioBitrate'],
          rows: [
            { 
              index: 0, 
              'tVideoBitrate': 0, 
              'tAudioBitrate': 0 
            },
        ]
      },
      packetsData: {
        columns: ["index", 'tVideoPacketLoss', 'tAudioPacketLoss'],
        rows: [
          { 
            index: 0, 
            'tVideoPacketLoss': 0, 
            'tAudioPacketLoss': 0 
          }
        ]
      },
      errMsgForTry: "",
      ProfileForTry: [
        {
          resolution: "480p_1",
          isSuccess: false
        },
        {
          resolution: "720p_1",
          isSuccess: false
        },
        {
          resolution: "1080p_1",
          isSuccess: false
        },
      ],
      currentProfile: 0,
      isUsingProxyRtcStatus: false,
    };
  },

  computed: {
    text() {
      const lang = langs[this.language] || 'en'
      const property = i18n[lang]['default']
      const obj = {}
      for (let key of Object.keys(property)) {
        Object.assign(obj, {
          [`${key}`]: property[key]
        })
      }
      return obj;
    },
    bitrateChartSettings() {
      return {
        yAxisName: [this.t('bitrate') + '(kbps)'],
        labelMap: {
          tVideoBitrate: this.t('Video_Bitrate'),
          tAudioBitrate: this.t('Audio_Bitrate')
        },
      }
    },
    packetsChartSettings() {
      return {
        yAxisType: ['percent'],
        yAxisName: [this.t('packet_loss')],
        labelMap: {
          tVideoPacketLoss: this.t('Video_Packet_Loss'),
          tAudioPacketLoss: this.t('Audio_Packet_Loss')
        },
      }
    },
    appId(){
      return DEFINED_APP_ID || APP_ID
    }
  },

  methods: {
    t (key) {
      const lang = langs[this.language] || 'en'
      const property = i18n[lang]['default']
      return property[key]
    },
    switchLanguage () {
      this.language = this.language === 0 ? 1 : 0
    },

    initialize() {
      window.global_sendStream = {}
      this.ts = new Date().getTime();
      this.channel =
        String(this.ts).slice(7) +
        Math.floor(Math.random() * 1000000).toString(36);
      this.sendId = Number.parseInt(String(this.ts).slice(7), 10) * 10 + 1;
      this.recvId = Number.parseInt(String(this.ts).slice(7), 10) * 10 + 2;
      this.sendClient = AgoraRtc.createClient({ mode: 'live', codec: 'h264' });
      this.sendClient.setClientRole('host');
      this.recvClient = AgoraRtc.createClient({ mode: 'live', codec: 'h264' });
      this.recvClient.setClientRole('audience')
      if(this.isEnableCloudProxy && this.fixProxyPort){
        // eslint-disable-next-line no-unused-vars
        const Force_UDPモード = 3
        // eslint-disable-next-line no-unused-vars
        const Force_TCPモード = 5
        this.sendClient.startProxyServer(Force_UDPモード);
        this.recvClient.startProxyServer(Force_UDPモード);
      }
      else if(this.isEnableCloudProxy && !this.fixProxyPort){
        this.sendClient.startProxyServer();
        this.recvClient.startProxyServer();
      }

      this.sendClient.on('join-fallback-to-proxy', ()=>{
          this.isUsingProxyRtcStatus = true
          console.log(':sushi:','fallback' )
        }
      )
    },

    async initSendClient() {        
        window.global_sendStream = {
          audio: await AgoraRtc.createMicrophoneAudioTrack(),
          video: await AgoraRtc.createCameraVideoTrack()
        }        
        await this.sendClient.join(this.appId, this.channel, null)
        await this.sendClient.publish([window.global_sendStream.audio, window.global_sendStream.video])
    },

    async initRecvClient() {
      await this.recvClient.join(this.appId, this.channel, null)

      this.recvClient.on('user-published', async (remoteUser, mediatype)=>{
        try {
          await this.recvClient.subscribe(remoteUser, mediatype)  

          // this.recvStream = evt.stream;
          if(mediatype === 'video'){
            remoteUser.videoTrack.play("test-recv")
          }
            // this.recvStream.disableAudio();
            
            let i = 1;
            if(this.detectInterval){
              clearInterval(this.detectInterval)
            }
            this.detectInterval = setInterval(() => {
              const videoStats = Object.values(this.recvClient.getRemoteVideoStats())[0]                        
              const audioStats = Object.values(this.recvClient.getRemoteAudioStats())[0]

              this.bitrateData.rows.push({
                index: i,
                tVideoBitrate: this._calcBitrate(
                  videoStats.receiveBytes, i
                ),
                tAudioBitrate: this._calcBitrate(
                  audioStats.receiveBytes, i
                )
              })

              this.packetsData.rows.push({
                index: i,
                tVideoPacketLoss: this._calcPacketLoss(
                  videoStats.receivePackets,
                  videoStats.receivePacketsLost  
                ),
                tAudioPacketLoss: this._calcPacketLoss(
                  audioStats.receivePackets,
                  audioStats.receivePacketsLost
                ),
              });
              i++;
            }, 1000);
          
        }catch (err){
          clearInterval(this.detectInterval);
          this.bitrateData = {};
          this.packetsData = {};
          this.testSuites[1].notError = false;
          this.testSuites[1].extra = err.msg;
          await this.destructAll();
          this.currentTestSuite = "5";
        }
      })
      // eslint-disable-next-line no-unused-vars
      this.recvClient.on('user-unpublished', async _ => {
        clearInterval(this.detectInterval);
        this.bitrateData = {};
        this.packetsData = {};
        this.testSuites[1].notError = false;
        this.testSuites[1].extra = "Disconnected";
        await this.destructAll();
        this.currentTestSuite = "5";
      })
    },

    /**
     * @param {string} recvPackets
     * @param {string} recvPacketsLost
     */
    _calcPacketLoss(recvPackets, recvPacketsLost) {
      let recvPacketsNumber = Number(recvPackets);
      let recvPacketsLostNumber = Number(recvPacketsLost);
      let totalPacketsNumber = recvPacketsNumber + recvPacketsLostNumber
      if(totalPacketsNumber) {
        return Number((recvPacketsLostNumber / totalPacketsNumber).toFixed(4));
      } else {
        return '-'
      }
    },

    /**
     * @param {string} recvBytes
     * @param {number} seconds
     */
    _calcBitrate(recvBytes, seconds) {
      return Number.parseFloat(recvBytes / seconds / 1000 * 8).toFixed(2);
    },

    async destructAll() {
      try {
        if(window.global_sendStream){
          window.global_sendStream.audio.stop()
          window.global_sendStream.audio.close()  
          
          window.global_sendStream.video.stop()
          window.global_sendStream.video.close()
        }
        this.recvStream && this.recvStream.close();
        // await this.sendClient.unpublish([window.global_sendStream.audio, window.global_sendStream.video]);
        this.sendClient.leave();
        this.recvClient.leave();
        if(this.isEnableCloudProxy){
          this.sendClient.stopProxyServer();
          this.recvClient.stopProxyServer();
        }
        clearInterval(this.detectInterval);
      } catch (err) {
        throw(err);
      }
    },

    start() {
      if (!this.appId) {
        alert("APP_ID cannot be empty!");
        return;
      }
      this.initialize();
      this.restore();
      this.testing = true;
      this.snackbar = false;
      this.dialog = false;
      this.languageDisabled = true;
      this.handleCompatibilityCheck();
    },

    restore() {
      this.testSuites.map(item => {
        item.notError = true;
        item.extra = "";
        item.complete = false;
      });
      this.currentTestSuite = "-1"
      this.inputVolume = 0
      this.renderChart = false
      this.testing = false
      this.profiles = profileArray.map(item => {
        item.status = "pending";
        return item;
      })
      this.bitrateData = {
        columns: ["index", 'tVideoBitrate', 'tAudioBitrate'],
        rows: [
          { 
            index: 0, 
            'tVideoBitrate': 0, 
            'tAudioBitrate': 0 
          }
        ]
      }
      this.packetsData = {
        columns: ["index", 'tVideoPacketLoss', 'tAudioPacketLoss'],
        rows: [
          { 
            index: 0, 
            'tVideoPacketLoss': 0, 
            'tAudioPacketLoss': 0 
          }
        ]
      }
    },

    handleCompatibilityCheck() {
      this.currentTestSuite = "0";
      let testSuite = this.testSuites["0"];
      setTimeout(async () => {
        testSuite.notError =  AgoraRtc.checkSystemRequirements();
        if(testSuite.notError){
          (testSuite.extra = this.t("fully_supported")) 
        }else{
          (testSuite.extra = this.t("some_functions_may_be_limited"));
        }
        await this.handleConnectivityCheck()
      }, 3000);
    },


    toggleProxy(val) {
      this.isEnableCloudProxy = val;
    },

    toggleProxyMode(val) {
      this.fixProxyPort = val;
    },

    async handleConnectivityCheck() {
      this.currentTestSuite = "1";
      let testSuite = this.testSuites[1];
      // init client and stream
      try {
        await this.initRecvClient();
        setTimeout(async() => {
          await this.initSendClient();
        }, 1000);        
        this.renderChart = true;
      } catch (err) {
        testSuite.extra = err.msg;
        testSuite.notError = false;
        setTimeout(async () => {
          this.testing = false;
          // this.currentTestSuite = "5";
          this.snackbar = true;
          await this.destructAll()
        }, 1500);
        return false;
      }
      // go on
      setTimeout(async () => {
        await this.destructAll();
        setTimeout(async () => {
          this.testing = false;
          // this.currentTestSuite = "5";
          this.snackbar = true;
          if (
            this.bitrateData.rows.length === 1 ||
            this.packetsData.rows.length === 1
          ) {
            testSuite.extra = "poor_connection";
            testSuite.notError = false;
          }
          if (this.bitrateData && this.packetsData) {
            let bitrateInfo = this.bitrateData.rows.pop();
            let packetInfo = this.packetsData.rows.pop();
          
            let videoBitrate = bitrateInfo.tVideoBitrate
            let audioBitrate = bitrateInfo.tAudioBitrate
            let videoPacketLoss = packetInfo.tVideoPacketLoss
            let audioPacketLoss = packetInfo.tAudioPacketLoss

            if(videoBitrate == 0 || audioBitrate == 0) {
               testSuite.notError = false;
            }
            if(videoPacketLoss !== '-') {
              videoPacketLoss = videoPacketLoss * 100
            }
            if(audioPacketLoss !== '-') {
              audioPacketLoss = audioPacketLoss * 100
            }
            testSuite.extra = `${ this.t('Video_Bitrate')}: ${ videoBitrate } kbps </br>
            ${ this.t('Audio_Bitrate')}: ${ audioBitrate } kbps </br>
            ${ this.t('Video_Packet_Loss')}: ${ videoPacketLoss } % </br>
            ${ this.t('Audio_Packet_Loss')}: ${ audioPacketLoss } % </br>
            proxyStatus: ${this.isUsingProxyRtcStatus.toString()}`;
          }
          await this.rtmCheckDisableProxy()
          await this.rtmCheckEnableProxy()
        }, 1500);
      }, 21500);
    },

    async rtmCheckDisableProxy(){
      this.testing = true;
      this.currentTestSuite = "2";       
      const testSuite = this.testSuites[2]
      try {
        // 初期化処理をして、コネクションを貼れれば疎通したとみなす
        await this.initializeRtm({useProxy: false})
        /** loginをするとLOGGEDINイベントが発火した後、ちょっとしてから
         *  login failedエラーが起こり、エラーをイベントで拾えないのでちょっとするまで待つ
        */        
        await sleep(2000) 
      } catch (error) {        
        this.testing = false;
        this.currentTestSuite = "3";

        testSuite.extra = 'conection NG (RTM)'
        testSuite.notError = false
        console.error(error)

        return
      }

      this.testing = false;
      this.currentTestSuite = "3";
      testSuite.extra = 'conection OK (RTM)'
      testSuite.notError = true
    },

    async rtmCheckEnableProxy(){
      this.testing = true;
      this.currentTestSuite = "3";       
      const testSuite = this.testSuites[3]
      try {
        // 初期化処理をして、コネクションを貼れれば疎通したとみなす
        await this.initializeRtm({useProxy: true})
        
      } catch (error) {        
        this.testing = false;
        this.currentTestSuite = "5";

        testSuite.extra = 'conection NG (RTM)'
        testSuite.notError = false
        console.error(error)

        return
      }

      this.testing = false;
      this.currentTestSuite = "5";
      testSuite.extra = 'conection OK (RTM)'
      testSuite.notError = true
    },
    async initializeRtm({useProxy}){
      return new Promise(async (resolve, reject)=>{
        const appId = this.appId

        const client = AgoraRtm.createInstance(appId,{
          enableCloudProxy: useProxy,
          logFilter: AgoraRtm.LOG_FILTER_DEBUG 
        })

        client.on('ConnectionStateChanged', async (state, reason)=>{
          if(state === 'CONNECTED'){
            resolve(state)
          }else if(state === 'CONNECTING') {
            // noop
          }else{
            reject(state)
          }          
        })

        try{
          await client.login({
            uid: (Math.random()*10000).toString(),
          })          
        }catch(e){
          reject(e)
        }
      })
    },
    haveATry() {
      this.snackbar = false;
      this.dialog = true;
      this.ProfileForTry.forEach((item) => {
        let index = this.profiles.findIndex((profile) => {
          return profile.resolution === item.resolution
        })
        if(index === -1) {
          return
        } 
        item.isSuccess = this.profiles[index].status === 'resolve'
      })
      this.retry(0);
    },

    retry(currentIndex) {
      if (window.global_sendStream && window.global_sendStream.isPlaying()) {
        window.global_sendStream.stop();
        window.global_sendStream.close();
      }
      //If the resolution is equal to not supported, 1. Do not play video stream; 2. Give error prompt
      if (this.ProfileForTry[currentIndex].isSuccess) {
        this.showVideo = true
      } else {
        this.showVideo = false
        return
      }
      window.global_sendStream = AgoraRtc.createStream({
        streamID: this.sendId,
        video: true,
        audio: true,
        screen: false
      });
      window.global_sendStream.setVideoProfile(this.ProfileForTry[currentIndex].resolution);
      window.global_sendStream.init(
        () => {
          window.global_sendStream.play("modal-video");
        },
        err => {
          this.errMsgForTry = err.msg;
        }
      );
    },

    endTry() {
      this.dialog = false;
      window.global_sendStream.stop();
      window.global_sendStream.close();
    }
  }
};
</script>

<style>
.zh .headline {
  font-size: 24px !important;
}
#test-send {
  width: 640px;
  height: 360px;
  position: fixed;
  right: -999999px;
}
#test-recv {
  width: 640px;
  height: 360px;
  position: fixed;
  right: -999999px;
}
#modal-video {
  width: 320px;
  height: 240px;
  margin: 0 auto;
}
@-webkit-keyframes rotate {
  0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg)
  }

  100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg)
  }
}

@keyframes rotate {
  0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg)
  }

  100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg)
  }
}
.github { 
  cursor: pointer;
  background-repeat: no-repeat;
  position: absolute;
  background-image: url("./assets/github.png");
  background-size: 50px;
  display: block;
  width: 50px;
  height: 50px;
  margin: 20px;
  border-radius: 28px;
  transform: translateY(-40px);
  -webkit-box-reflect: below;
  -webkit-box-reflect:below 2px 
  -webkit-linear-gradient(90deg, rgba(0,0,0,0) 15%,rgba(0,0,0,0.5));
 }

.aperture {
  /* display: inline-block; */
  width: 58px !important;
  height: 58px !important;
  position: absolute;
  right: 260px;
  top: 28px;
  z-index: 1999;
}

.aperture::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    top: -24px;
    left: 16px;
    border-radius: 50%;
    box-shadow: inset 0 0 10px #fff06a, inset 4px 0 16px #f0f, inset -4px 0 16px #0ff, inset 4px 0 16px #f0f, inset -4px 0 16px #0ff, 0 0 10px #fff06a, -6px 0 36px #f0f, 6px 0 36px #0ff;
    -webkit-animation: rotate 3s infinite linear;
    animation: rotate 3s infinite linear;
}

.v-list__tile {
  min-height: 48px!important;
  height: auto!important;
}

  .proxy {
    font-size: 12px;
    margin-left: 16px;
    margin-top: 12px;
    text-align: end;
    padding-right: 60px !important;
  }
  .proxy .v-label {
    color: #333333;
    width: 100px;
    display: block;
    float: left;
    line-height: 36px;
    height: 36px;
    text-align: start;
  }
  .proxy .v-btn__content {
    font-size: 12px;
  }
  .proxy .v-btn-toggle .v-btn{
    width: 80px;
  }
  .proxy .v-btn-toggle .v-btn.v-btn--active {
    background-color: dodgerblue;
    color: white;
  }
  .tip {
    color: #666666;
    font-size: 12px;
    padding-left: 36px;
  }
  .tip_icon{
    background-repeat: no-repeat;
    position: absolute;
    background-image: url("./assets/info.png");
    background-size: 18px;
    display: inline-block;
    width: 18px;
    height: 18px;
    margin-left: -24px;
  }
  .v-card__text {
    padding: 0 16px;
    width: 100%;
  }
  .v-card {
    min-width: 280px;
  }
.v-list__tile__content{
  margin-left: 4rem;
}
</style>
