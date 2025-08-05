---
title: channel之生产者消费者模型
description: 生产者消费者模型通过引入缓冲区，实现了生产与消费的解耦。无缓冲区的 channel 要求生产者与消费者同步配合，否则会阻塞，适合处理必须顺序执行的场景；而有缓冲区的 channel 则允许生产者先发送多个数据，无需等待消费者处理完成，适用于并发处理、异步任务等高性能场景。缓冲区提升了系统的灵活性、并发性和容错性。
author: 浩瀚星河
pubDatetime: 2025-08-04T11:00:46.872Z
modDatetime: 2025-08-04T11:02:33.526Z
slug: go-channel3
featured: false
tags: [channel]
ogImage: https://blog-api.golangblog.com/images/1754295609kmHPREpSda.jpg
---

      ## 生产者消费者模型

什么是生产者和消费者模型，这是一种常见的并发设计模式，就是有一个模块在生产数据（数据是广义的，包含线程、进程、函数、协程、类、函数），另一个模块在处理数据，这两个模块分别称为生产者和消费者。单独抽象出生产者和消费者是不够的，还需要一个缓冲区连接起生产者和消费者。

为什么要这样设计，假如我们寄快递，生产者直接把快递交给收件人（消费者），一旦收件人没空、拒收，或者快递员下班了，整个流程就会中断。
但如果引入快递驿站（缓冲区）中转，发件人只需投递到驿站，收件人随时都可以自取，这大大提升了灵活性和可靠性。

- 包装快递 - 生产数据
- 放入驿站 - 放入缓冲区
- 取快递并拆开 - 处理数据

这样做的优点是：

1. 解耦，生产者并不需要直接依赖于消费者，假如没有缓冲区，必不可免的需要考虑消费者的处理数据状态，才能继续的生产数据。如今有了缓冲区，生产者只需要把生产的数据放入缓冲区，消费者根据需要自取即可
2. 并发，消费者处理时间不等，生产者只负责生产分发，不会因为某一个流程而阻塞
3. 缓存，生产和消费速率不对等，生产者生产资源过快如果没有缓冲区，消费者资源利用率不足，有缓冲区可以把资源缓存起来

### 无缓冲区

```go
package main

import (
	"fmt"
	"time"
)

// 生产者
func producer(ch chan<- int) {
	for i := 0; i < 3; i++ {
		fmt.Printf("生产者%d发送\n", i+1)
		ch <- i + 1
		time.Sleep(time.Millisecond * 500)
	}
	// 关闭管道
	fmt.Println("关闭ch")
	close(ch)
}

// 消费者
func consumer(ch <-chan int) {
	for v := range ch {
		fmt.Println("消费者接收到值")
		fmt.Println("<-ch", v)
		time.Sleep(2 * time.Second)
	}
}

func main() {
	ch := make(chan int)
	go producer(ch)
	consumer(ch)
}
```

无缓冲区的 channel:

1. 生产者发送 1，消费者立即接到，生产者 sleep0.5 秒，此时消费者还需 1.5 秒才能继续接收值 （耗时 2 秒）
2. 生产者发送 2，消费者在 1.5 秒后接到，生产者 sleep0.5 秒，此时消费者还需 1.5 秒才能继续接收值 （耗时 2 秒）
3. 生产者发送 3，消费者在 1.5 秒后接到，生产者 sleep0.5 秒，此时消费者还需 1.5 秒才结束 （耗时 2 秒）

### 有缓冲区

```go
package main

import (
	"fmt"
	"time"
)

// 生产者
func producer(ch chan<- int) {
	for i := 0; i < 3; i++ {
		fmt.Printf("生产者%d发送\n", i+1)
		ch <- i + 1
		time.Sleep(time.Millisecond * 500)
	}
	// 关闭管道
	fmt.Println("关闭ch")
	close(ch)
}

// 消费者
func consumer(ch <-chan int) {
	for v := range ch {
		fmt.Println("消费者接收到值")
		fmt.Println("<-ch", v)
		time.Sleep(2 * time.Second)
	}
}

func main() {
	ch := make(chan int, 3)
	go producer(ch)
	consumer(ch)
}
```

有缓冲区的 channel:

1. 生产者发送 1，消费者立即接到，生产者 sleep0.5 秒，此时消费者还需 1.5 秒才能继续接收值 （生产者耗时 0.5 秒）
2. 生产者发送 2，消费者在 1.5 秒后接到，生产者 sleep0.5 秒，此时消费者还需 1.5 秒才能继续接收值 （生产者耗时 0.5 秒）
3. 生产者发送 3，消费者在 1.5 秒后接到，生产者 sleep0.5 秒，此时消费者还需 1.5 秒才结束 （生产者耗时 0.5 秒）

通过上述案例我们发现无缓冲区的 channel，在等待子任务处理并完成的时候会有 1.5 秒的空档期，在这个过程中，channel 是被阻塞的，无法进行新一轮的读入；
而有缓冲区的 channel，是不阻塞生产者的，可以一次性分发完，不需要考虑消费者的完成时间

## 小结

| 模式     | 是否阻塞生产者 | 是否解耦 | 适合场景                 |
| -------- | -------------- | -------- | ------------------------ |
| 无缓冲区 | 是             | 否       | 处理必须同步、顺序场景   |
| 有缓冲区 | 否             | 是       | 并发处理、解耦、异步场景 |
