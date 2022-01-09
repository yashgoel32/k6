import http from 'k6/http'

export let options = {
	vus: 5,
	duration: '5s',
	rps: 5
}

export default function(){
	http.get('https://run.mocky.io/v3/47332476-c90e-46de-adad-6efca5adb11c')
}