import Engine from '../../engine/vichan/index.js'

const config = {
	"id": "crbachan",
	"domain": "ib.crba.dedyn.io",
	"engine": "vichan",
	"defaultAuthorName": "Anonymous",
	"boards": [
		{
			"id": "crba",
			"title": "Canterlot Royal Ballet Academy"
		},
    {
			"id": "b",
			"title": "Random"
		}
  ]
};

export default (options) => new Engine(config, options)
