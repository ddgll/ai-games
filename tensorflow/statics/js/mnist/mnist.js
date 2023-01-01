import * as tf from '@tensorflow/tfjs';
import MnistData from './data'

export default class MNIST {
  constructor () {
    this.learninRate = 0.15;
    this.batchSize = 64;
    this.trainBatches = 100;
    this.testBatchSize = 1000;
    this.testIterationFrequency = 5;

    this.data = new MnistData()

    this.model = this.buildNetwork()
  }

  async load() {
    await this.data.load()
  }

  buildNetwork () {
    const optimizer = tf.train.sgd(this.learninRate);
    const model = tf.sequential();
    // Premier layer
    model.add(tf.layers.conv2d({ // 2D convolutional layer
      inputShape: [ 28, 28, 1 ], // format des entrées
      kernelSize: 5, // Taille de fenêtre de filtrage convolutionnel 5
      filters: 8, // nombre de filtre de taill kernelSize 8
      strides: 1, // Taille du "pas" de ma fenêtre 1
      activation: 'relu',
      kernelInitializer: 'VarianceScaling'
    }))

    // Second layer
    model.add(tf.layers.maxPooling2d({ 
      poolSize: [ 2, 2],
      strides: [2, 2]
    }))

    // Third
    model.add(tf.layers.conv2d({
      kernelSize: 5, // 5
      filters: 16, // 16
      strides: 1, // 1
      activation: 'relu',
      kernelInitializer: 'VarianceScaling'
    }));

    // Forth
    model.add(tf.layers.maxPooling2d({
      poolSize: [2, 2],
      strides: [2, 2]
    }));

    model.add(tf.layers.flatten());

    model.add(tf.layers.dense({
      units: 10,
      kernelInitializer: 'VarianceScaling',
      activation: 'softmax'
    }));

    model.compile({
      optimizer: optimizer,
      loss: 'categoricalCrossentropy',
      metrics: [ 'accuracy' ],
    });

    return model
  }

  async train (ui) {
    ui.isTraining();
    const lossValues = [];
    const accuracyValues = [];

    for (let i = 0; i < this.trainBatches; i++) {
      console.log('TRAIN', i)
      const batch = this.data.nextTrainBatch(this.batchSize);
      let testBatch;
      let validationData;
      // Every few batches test the accuracy of the mode.
      if (i % this.testIterationFrequency === 0) {
        testBatch = this.data.nextTestBatch(this.testBatchSize);
        validationData = [
          testBatch.xs.reshape([this.testBatchSize, 28, 28, 1]), testBatch.labels
        ];
      }
     
      // The entire dataset doesn't fit into memory so we call fit repeatedly
      // with batches.
      const result = await this.model.fit(
          batch.xs.reshape([this.batchSize, 28, 28, 1]),
          batch.labels,
          {
            batchSize: this.batchSize,
            validationData,
            epochs: 1
          })

      const loss = result.history.loss[0]
      const accuracy = result.history.acc[0]

      // Plot loss / accuracy.
      lossValues.push({'batch': i, 'loss': loss, 'set': 'train'});
      ui.plotLosses(lossValues);

      if (validationData != null) {
        accuracyValues.push({'batch': i, 'accuracy': accuracy, 'set': 'train'});
        ui.plotAccuracies(accuracyValues);
      }

      // Call dispose on the training/test tensors to free their GPU memory.
      tf.dispose([batch, validationData]);

      // tf.nextFrame() returns a promise that resolves at the next call to
      // requestAnimationFrame(). By awaiting this promise we keep our model
      // training from blocking the main UI thread and freezing the browser.
      await tf.nextFrame();
    }
  }

  showPredictions (showTestResults) {
    const testExamples = 100
    const batch = this.data.nextTestBatch(testExamples);
    tf.tidy(() => {
      const output = this.model.predict(batch.xs.reshape([-1, 28, 28, 1]))
      const axis = 1
      const labels = Array.from(batch.labels.argMax(axis).dataSync())
      const predictions = Array.from(output.argMax(axis).dataSync())
      if (typeof showTestResults === 'function') showTestResults(batch, predictions, labels)
    });
  }
}






