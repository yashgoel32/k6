import http from 'k6/http'
import {sleep, check} from 'k6'
import {Rate, Trend} from 'k6/metrics'

export let errorRate = new Rate('errors1') //errors1 is defined in thresholds in options.

export let myTrend1 = new Trend('Get_myTrend1')
export let myTrend2 = new Trend('Get_Google_myTrend2')

export let options = {
	
	/*
	stages: [
		{ duration: '5s', target: 5 },
		{ duration: '10s', target: 10 }
	]
	*/

	thresholds:{
		errors1: ['rate<0.1']	
	},

	vus: 1,
	duration: '1s'
}

export default function(){
	
	var url = 'https://run.mocky.io/v3/47332476-c90e-46de-adad-6efca5adb11c'

	var params = {
		headers: {
			'Content-Type': 'application/json'
		}
	}

	var response = http.get(url, params)

	const checks = check(response,{
		'is response 200 ' : (r) => r.status === 200
	})

	const check1 = check(response,{
		'response body is' : (r) => r.body.length == 339
	})
	errorRate.add(!check1) 

	const check2 = check(response,{
		'error rate is greater than 10%' : (r) => r.body.length == 100
	})
	errorRate.add(!check2) // we can add to same or different errorRate variables

	myTrend1.add(response.timings.duration)
	
	console.log(`VUser number = ${__VU} and Iteration = ${__ITER}`)
	
	console.log(`Response body segment is: ${JSON.parse(response.body).data[0].name}`)

	JSON.parse(response.body).data.forEach(
		element => {
			console.log(element.name)
		}
	)

	sleep(1)

	let googleResponse = http.get('http://google.com')
	myTrend2.add(googleResponse.timings.duration)
	
}