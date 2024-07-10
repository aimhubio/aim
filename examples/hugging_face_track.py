import evaluate
import numpy as np

from aim.hugging_face import AimCallback
from datasets import load_dataset
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
)


def tokenize_function(examples):
    return tokenizer(examples['text'], padding='max_length', truncation=True)


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return metric.compute(predictions=predictions, references=labels)


dataset = load_dataset('yelp_review_full')


tokenizer = AutoTokenizer.from_pretrained('bert-base-cased')

tokenized_datasets = dataset.map(tokenize_function, batched=True)

small_train_dataset = tokenized_datasets['train'].shuffle(seed=42).select(range(1000))
small_eval_dataset = tokenized_datasets['test'].shuffle(seed=42).select(range(1000))

metric = evaluate.load('accuracy')

model = AutoModelForSequenceClassification.from_pretrained('bert-base-cased', num_labels=5)

training_args = TrainingArguments(output_dir='test_trainer')

aim_callback = AimCallback(experiment='example_experiment')


trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=small_train_dataset,
    eval_dataset=small_eval_dataset,
    compute_metrics=compute_metrics,
    callbacks=[aim_callback],
)

trainer.train()
