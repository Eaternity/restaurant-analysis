const fs = require('fs')
const split2 = require('split2')
const client = require('./connection')
const through2 = require('through2')
const each = require('async-each-series')

const targetDir = `${__dirname}/data`
const allFiles = fs.readdirSync(targetDir)

const elasticCreate = jsonObj => {
  client.create({
    index: 'restaurant',
    type: 'order',
    id: Math.random().toString().split('.')[1],
    body: jsonObj
  })
  .then(x => console.log(x))
  .catch(err => console.error(`ERROR: ${err}`))
}

const elastify = filePath => {
  const fullPath = `${targetDir}/${filePath}`
  const reg = new RegExp('^A\\d+$')
  const allOrders = []

  const orders = fs.createReadStream(fullPath)
    .pipe(split2())
    .pipe(through2({ objectMode: true }, (line, _, next) => {
      const splitLine = line.split(';')

      if (reg.test(splitLine[0])) {
        orders.push({
          'Kitchen ID': splitLine[0],
          'Year': Number(splitLine[1]),
          'Month': Number(splitLine[2]),
          'Food Service Product ID': splitLine[3],
          'Food Service Product Name (de)': splitLine[4],
          'Total Weight [kg]': parseFloat(splitLine[5]),
          'Total CO2 [kg]': parseFloat(splitLine[6]),
          'Total Energy [kJ]': parseFloat(splitLine[7]),
          'Transport CO2 [kg]': parseFloat(splitLine[8]),
          'Transport (air) CO2 [kg]': parseFloat(splitLine[9]),
          'Transport (ground) CO2 [kg]': parseFloat(splitLine[10]),
          'Production CO2 [kg]': parseFloat(splitLine[11]),
          'Conservation CO2 [kg]': parseFloat(splitLine[12]),
          'Conservation (frozen) CO2 [kg]': parseFloat(splitLine[13])
        })
      }
      next()
    }))
    .on('data', data => allOrders.push(data))
    .on('end', () => {
      each(allOrders, (order, next) => {
        elasticCreate(order)
        next()
      }, err => {
        if (err) console.error(err)
        console.log('All orders elastified')
      })
    })
}

allFiles.forEach(filePath => elastify(filePath))
