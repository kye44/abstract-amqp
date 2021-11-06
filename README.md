# abstract-amqp
Simple abstraction of amqp-connection-manager for Typescript.

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
