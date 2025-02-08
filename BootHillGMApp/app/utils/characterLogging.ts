import { StartData, AIResponseData, ParsedData, CompleteData, ErrorData } from '../types/character';

type LogStage = 'start' | 'aiResponse' | 'parsed' | 'complete' | 'error' | 'fallback';

export class CharacterLogger {
  constructor(private context: string) {}
  
  start(data: StartData) {
    this.log('start', data);
  }
  
  log(stage: LogStage, data: StartData | AIResponseData | ParsedData | CompleteData | ErrorData) {
    console.log(`[Character ${this.context}] ${stage}`, {
      timestamp: new Date().toISOString(),
      data
    });
  }
  
  error(error: Error) {
    console.error(`[Character ${this.context}] Error`, {
      timestamp: new Date().toISOString(),
      error
    });
  }
  
  complete(data: CompleteData) {
    this.log('complete', data);
  }
}

export function useCharacterLogger(context: string) {
  const logger = new CharacterLogger(context);
  
  return {
    log: (stage: LogStage, data: StartData | AIResponseData | ParsedData | CompleteData | ErrorData) => logger.log(stage, data),
    error: (error: Error) => logger.error(error)
  };
}
