// @ts-ignore
import { CommandOriginalFn, VisitOptions, TypeOptions } from 'cypress';

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      visit(originalFn: CommandOriginalFn<any>, url: string, options: Partial<VisitOptions>): Chainable<Element>
    }
  }
}

export function setupWindowSQLiteMock(win: Cypress.AUTWindow) {
  const mockDataStore: { [key: string]: any[] } = {
    user: [],
    task: [],
    experience: [],
    certs: []
  };

  const createMockResultSet = (rowsAffected: number = 0, rowsData: any[] = []): any => ({
    rowsAffected: rowsAffected,
    rows: {
      length: rowsData.length,
      item: (index: number) => rowsData[index] || null
    }
  });

  const mockDbInstance = {
    executeSql: (
      sql: string,
      params: any[] = [],
      successCb?: (result: any) => void,
      errorCb?: (err: any) => void
    ): Promise<any> => {
      console.log(`Mock SQLite: SQL: "${sql}", Params: ${JSON.stringify(params)}`);
      
      return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (sql.toUpperCase().includes('CREATE TABLE')) {
            successCb?.( createMockResultSet(0, []));
          } else if (sql.toUpperCase().includes('INSERT INTO USER')) {
            const newUser = {
              id: mockDataStore.user.length + 1,
              username: params[0], password: params[1], nombre: params[2],
              apellido: params[3], nivelEducacion: params[4], fechaNacimiento: params[5]
            };
            mockDataStore.user.push(newUser);
            successCb?.(createMockResultSet(1, [newUser]));
          } else if (sql.toUpperCase().includes('SELECT * FROM USER WHERE USERNAME = ?')) {
            const usernameToFind = params[0];
            const foundUser = mockDataStore.user.find(u => u.username === usernameToFind);
            if (foundUser) {
              console.log('Mock SQLite: Usuario encontrado:', foundUser);
              successCb?.( createMockResultSet(1, [foundUser]));
            } else {
              console.log(`Mock SQLite: User '${usernameToFind}' not found.`);
              successCb?.( createMockResultSet(0, []));
            }
          } else {
            successCb?.( createMockResultSet(0));
            resolve(null);
          }
        } catch (e) {
          console.error('Mock SQLite Error:', e);
          if (errorCb) { errorCb(e); }
        }
      }, 50);
    })
    },
    transaction: (fn: (tx: any) => void, errorCb?: (err: any) => void, successCb?: () => void) => {
      console.log('Mock SQLite: Transaccion iniciada.');
      try {
        fn({ executeSql: mockDbInstance.executeSql });
        
        if (successCb) {
          setTimeout(() => {
            console.log('Mock SQLite: Trasaccion exitosa.');
            successCb();
          }, 100); 
        }
      } catch (e) {
        console.error('Mock SQLite Transaction Error:', e);
        if (errorCb) { errorCb(e); }
      }
    },
    close: () => { console.log('Mock SQLite: close() llamado.'); }
  };

  (win as any).sqlitePlugin = {
    openDatabase: (_options: any, successCb?: (db: any) => void) => {
      console.log('Mock SQLite: openDatabase llamado.');
      if (successCb) {
        successCb(mockDbInstance);
      }
      return mockDbInstance;
    }
  };
}
