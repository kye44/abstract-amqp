import { AmqpConnectionManagerClass, ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';

export interface IAMQPDal {
    /**
    * Connects to an AMQP host asynchronously.
    * 
    * @remarks Await this method to get accurate return value.
    * @returns True if connected successfully or false if failed.
    */
    ConnectAsync(): Promise<boolean>;

    /**
  * Connects to an AMQP host synchronously.
  * 
  * @remarks As this method is synchronous, the return result may not be accurate.
  * @returns True if connected successfully or false if failed.
  */
    Connect(): void;

    /**
  * Creates a channel to communicate with a given queue.
  * 
  * @param queue - The queue to connect to.
  * @param onMessage - When passed, the channel acts as a consumer; onMessage will be called when a message hits the specified queue.
  */
    CreateChannel(queue: string, onMessage?: (msg: ConsumeMessage | null) => void): ChannelWrapper;

    /**
   * Sends a message to a queue. If a channel does not already exist for the specified queue, a channel is created.
   * 
   * @param queue - The queue to send to.
   * @param message - The message to send.
   */
    SendToQueueAsync(queue: string, message: any): Promise<void>;
}

export class AMQPDal implements IAMQPDal {
    private host: string;
    private connectionManager: AmqpConnectionManagerClass;
    private channels: Map<string, ChannelWrapper>;

    public constructor(host: string) {
        this.host = host;
        this.connectionManager = new AmqpConnectionManagerClass([this.host]);
        this.channels = new Map<string, ChannelWrapper>();
    }

    /**
     * Connects to an AMQP host asynchronously.
     * 
     * @remarks Await this method to get accurate return value.
     * @returns True if connected successfully or false if failed.
     */
    public async ConnectAsync(): Promise<boolean> {
        try {
            await this.connectionManager.connect();
            return this.connectionManager.isConnected();
        }
        catch {
            return false;
        }
    }

    /**
   * Connects to an AMQP host synchronously.
   * 
   * @remarks As this method is synchronous, the return result may not be accurate.
   * @returns True if connected successfully or false if failed.
   */
    public Connect(): boolean {
        try {
            this.connectionManager.connect();
            return true;
        }
        catch {
            return false;
        }
    }

    /**
   * Creates a channel to communicate with a given queue.
   * 
   * @param queue - The queue to connect to.
   * @param onMessage - When passed, the channel acts as a consumer; onMessage will be called when a message hits the specified queue.
   */
    public CreateChannel(queue: string, onMessage?: (msg: ConsumeMessage | null) => void): ChannelWrapper {
        const channel = this.connectionManager.createChannel(
            {
                json: true,
                setup: async (channel: ConfirmChannel): Promise<void> => {
                    await channel.assertQueue(queue, { durable: true });
                    if (onMessage) {
                        channel.consume(queue, onMessage, { noAck: true });
                    }
                }
            }
        )

        this.channels.set(queue, channel);
        return channel;
    }

    /**
    * Sends a message to a queue. If a channel does not already exist for the specified queue, a channel is created.
    * 
    * @param queue - The queue to send to.
    * @param message - The message to send.
    */
    public async SendToQueueAsync(queue: string, message: any): Promise<void> {
        var channel = this.channels.get(queue);
        if (!channel) {
            channel = this.CreateChannel(queue);
        }

        await channel.sendToQueue(queue, message);
    }
}


