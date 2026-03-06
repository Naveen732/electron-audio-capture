<template>
<div style="padding:40px">

<h2>System Audio Recorder (WAV)</h2>

<button @click="startRecording">Start Recording</button>
<button @click="stopRecording">Stop Recording</button>

<p>{{ status }}</p>

</div>
</template>

<script>

export default {

data(){
return{
recorder:null,
chunks:[],
status:"Idle"
}
},

methods:{

async startRecording(){

this.chunks = []

const stream = await navigator.mediaDevices.getDisplayMedia({
audio:true,
video:true
})

const audioTracks = stream.getAudioTracks()

const audioStream = new MediaStream(audioTracks)

this.recorder = new MediaRecorder(audioStream)

this.recorder.ondataavailable = (e)=>{
if(e.data.size > 0){
this.chunks.push(e.data)
}
}

this.recorder.onstop = this.convertToWav

this.recorder.start(100)

this.status="Recording..."

},

stopRecording(){

if(this.recorder){
this.recorder.stop()
this.status="Stopped"
}

},

async convertToWav(){

const blob = new Blob(this.chunks,{type:"audio/webm"})

const arrayBuffer = await blob.arrayBuffer()

const audioContext = new AudioContext()

const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

const wavBuffer = this.encodeWAV(audioBuffer)

const wavBlob = new Blob([wavBuffer],{type:"audio/wav"})

const url = URL.createObjectURL(wavBlob)

const a = document.createElement("a")
a.href = url
a.download = "system_audio.wav"
a.click()

},

encodeWAV(audioBuffer){

const samples = audioBuffer.getChannelData(0)
const sampleRate = audioBuffer.sampleRate

const buffer = new ArrayBuffer(44 + samples.length * 2)

const view = new DataView(buffer)

function writeString(view,offset,str){
for(let i=0;i<str.length;i++){
view.setUint8(offset+i,str.charCodeAt(i))
}
}

writeString(view,0,"RIFF")
view.setUint32(4,36 + samples.length*2,true)
writeString(view,8,"WAVE")
writeString(view,12,"fmt ")
view.setUint32(16,16,true)
view.setUint16(20,1,true)
view.setUint16(22,1,true)
view.setUint32(24,sampleRate,true)
view.setUint32(28,sampleRate*2,true)
view.setUint16(32,2,true)
view.setUint16(34,16,true)
writeString(view,36,"data")
view.setUint32(40,samples.length*2,true)

let offset = 44

for(let i=0;i<samples.length;i++,offset+=2){
let s = Math.max(-1,Math.min(1,samples[i]))
view.setInt16(offset,s<0?s*0x8000:s*0x7FFF,true)
}

return buffer

}

}

}

</script>