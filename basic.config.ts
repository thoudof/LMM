export const schema = {
  "tables": {
    "clients": {
      "type": "collection",
      "fields": {
        "name": {
          "type": "string",
          "indexed": true
        },
        "inn": {
          "type": "string",
          "indexed": true
        },
        "contactPerson": {
          "type": "string",
          "indexed": true
        },
        "phone": {
          "type": "string",
          "indexed": true
        },
        "email": {
          "type": "string",
          "indexed": true
        },
        "address": {
          "type": "string",
          "indexed": true
        },
        "notes": {
          "type": "string",
          "indexed": true
        }
      }
    },
    "trips": {
      "type": "collection",
      "fields": {
        "date": {
          "type": "string",
          "indexed": true
        },
        "clientId": {
          "type": "string",
          "indexed": true
        },
        "startLocation": {
          "type": "string",
          "indexed": true
        },
        "endLocation": {
          "type": "string",
          "indexed": true
        },
        "cargo": {
          "type": "string",
          "indexed": true
        },
        "driver": {
          "type": "string",
          "indexed": true
        },
        "vehicle": {
          "type": "string",
          "indexed": true
        },
        "status": {
          "type": "string",
          "indexed": true
        },
        "income": {
          "type": "number",
          "indexed": true
        },
        "expenses": {
          "type": "number",
          "indexed": true
        },
        "notes": {
          "type": "string",
          "indexed": true
        }
      }
    },
    "tripHistory": {
      "type": "collection",
      "fields": {
        "tripId": {
          "type": "string",
          "indexed": true
        },
        "changeDate": {
          "type": "string",
          "indexed": true
        },
        "changedFields": {
          "type": "string",
          "indexed": true
        },
        "previousValues": {
          "type": "string",
          "indexed": true
        },
        "newValues": {
          "type": "string",
          "indexed": true
        }
      }
    },
    "documents": {
      "type": "collection",
      "fields": {
        "tripId": {
          "type": "string",
          "indexed": true
        },
        "name": {
          "type": "string",
          "indexed": true
        },
        "type": {
          "type": "string",
          "indexed": true
        },
        "uri": {
          "type": "string",
          "indexed": true
        },
        "uploadDate": {
          "type": "string",
          "indexed": true
        },
        "notes": {
          "type": "string",
          "indexed": true
        }
      }
    }
  },
  "version": 1,
  "project_id": "20d48076-c4dd-46f8-92c0-ecb36c0f9c42"
};