# Abstract-AMQP
Simple abstraction of amqp-connection-manager for Typescript.
## Installation
Abstract-AMQP can be installed via npm `npm install --save abstract-amqp`.
## Usage
### Connecting to an AMQP host
Inorder to conenct to an AMQP host using Abstract-AMQP, an instance of `AMQPDal` must be created with the host address provided. Once created, the `ConnectAsync` method can be called on the `AMQPDAL`; this will return the result of the attempted connection.

`NOTE: AMQPDal can only connect to one AMQP host at a time.` 
```typescript
const main = async () => {
    var amqpDal = new AMQPDal('amqp://localhost');
    var result = await amqpDal.ConnectAsync();
}

main();
```
### Creating a channel
A channel must be created to publish or consume messages from a queue. A channel can be created by using the `CreateChannel` method; this method takes a queue name and a message handler as parameters. A channel is also automatically created when attempting to send a message to a queue that does not have an associated channel in the `AMQPDal`.

`NOTE: If a message handler is not provided, the channel will be setup to only publish messages.`
```typescript
const main = async () => {
    var amqpDal = new AMQPDal('amqp://localhost');
    const result = await amqpDal.ConnectAsync();
    if (result) {
        console.log('Connected to RabbitMQ.');
        amqpDal.CreateChannel('testQueue', (msg: ConsumeMessage | null) => console.log(msg?.content.toString()));
    }
}

main();
```
### Sending messages
Messages can be published to a queue via the `SendToQueueAsync` method, this method takes a queue name and a message as parameters. Messages must be in JSON format.
```typescript
const main = async () => {
    var amqpDal = new AMQPDal('amqp://localhost');
    const result = await amqpDal.ConnectAsync();
    if (result) {
        console.log('Connected to RabbitMQ.');
        amqpDal.CreateChannel('testQueue', (msg: ConsumeMessage | null) => console.log(msg?.content.toString()));
        amqpDal.SendToQueueAsync('testQueue', { content: 'Hellow World!' });
    }
}

main();
```

