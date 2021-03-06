
import http from 'k6/http'
import {sleep, check, group} from 'k6'
import {Rate, Trend} from 'k6/metrics'

// *********** init section ***************

var count = 10

export let errorRate = new Rate('errors1') //errors1 is defined in thresholds in options.

export let myTrend1 = new Trend('Get_myTrend1')
export let myTrend2 = new Trend('Get_Google_myTrend2')

export let groupTrend = new Trend('groupTrend')

export let options = {
	
	/*
	stages: [
		{ duration: '5s', target: 5 },
		{ duration: '10s', target: 10 }
	]
	*/

	thresholds:{
		errors1: ['rate<0.1'],
		'checks': ['rate<0.3'],

		'http_req_duration': ['p(95)<600', 'p(90)<500'], // normal trend

		'http_req_duration{type: Tag_API_2}': ['p(95)<600'], // api trend

		'groupTrend{groupName:API 2}': ['avg<300'], // group trend
	},

	vus: 3,
	duration: '1s'
}

// ********* setup section ****************

export function setup(){
	console.log(`Inside setup section - ${count}`)
	return 'Hello World!'
}


// ********* main vu section **************

export default function(data){

	console.log(`Data returned from setup function - ${data}`)

	console.log(`VUser number = ${__VU} and Iteration = ${__ITER}`)

	console.log(`Inside vu section - ${count}`)
	count = count + 1
	console.log(`Inside vu section - ${count}`)

	group("API 1", function(){
		
		var url = 'https://run.mocky.io/v3/47332476-c90e-46de-adad-6efca5adb11c'
		var params = {
			headers: {
				'Content-Type': 'application/json'
			}
		}
		var response = http.get(url, params)

		const check1 = check(response,{
			'is response 200 ' : (r) => r.status === 200,
			'response body is' : (r) => r.body.length == 339
		})
		errorRate.add(!check1) 

		const check2 = check(response,{
			'error rate is greater than 10%' : (r) => r.body.length == 100
		})
		errorRate.add(!check2) // we can add to same or different errorRate variables

		myTrend1.add(response.timings.duration)

		console.log(`Response body segment is: ${JSON.parse(response.body).data[0].name}`)

		JSON.parse(response.body).data.forEach(
			element => {
				console.log(element.name)
			}
		)
	})

	sleep(1)

	group("API 2", function(){
		let googleResponse = http.get('https://run.mocky.io/v3/21cf5daa-0be0-4f1e-9494-56f67c9c86ab', {
			tags: {
				type: 'Tag_API_2' // API tag
			}
		})

		check(googleResponse, {
			'is status 200 : ' : r => r.status === 200,
			tags:{
				type: 'Check_API_2' // Check tag
			}
		})

		myTrend2.add(googleResponse.timings.duration, {type: 'Tag_API_2'}) // using tag in api trend
	})
	groupTrend.add(400, {groupName: 'API 2'})
	
}


// ****** tear down section **********

export function teardown(data){
	console.log(`Inside tear down section - ${count}`)	
}