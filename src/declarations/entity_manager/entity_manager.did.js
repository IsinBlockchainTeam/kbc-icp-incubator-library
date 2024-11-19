"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = exports.idlFactory = void 0;
const idlFactory = ({
  IDL
}) => {
  return IDL.Service({
    'addDocument': IDL.Func([IDL.Nat, IDL.Variant({
      'PRE_SHIPMENT_SAMPLE': IDL.Null,
      'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'SHIPPING_INSTRUCTIONS': IDL.Null,
      'PHYTOSANITARY_CERTIFICATE': IDL.Null,
      'SHIPPING_NOTE': IDL.Null,
      'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'GENERIC': IDL.Null,
      'CARGO_COLLECTION_ORDER': IDL.Null,
      'BOOKING_CONFIRMATION': IDL.Null,
      'BILL_OF_LADING': IDL.Null,
      'TRANSPORT_CONTRACT': IDL.Null,
      'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
      'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
      'EXPORT_INVOICE': IDL.Null,
      'ORIGIN_CERTIFICATE_ICO': IDL.Null,
      'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
      'SERVICE_GUIDE': IDL.Null,
      'WEIGHT_CERTIFICATE': IDL.Null,
      'EXPORT_CONFIRMATION': IDL.Null
    }), IDL.Text], [IDL.Record({
      'id': IDL.Nat,
      'sampleApprovalRequired': IDL.Bool,
      'documents': IDL.Vec(IDL.Tuple(IDL.Variant({
        'PRE_SHIPMENT_SAMPLE': IDL.Null,
        'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'SHIPPING_INSTRUCTIONS': IDL.Null,
        'PHYTOSANITARY_CERTIFICATE': IDL.Null,
        'SHIPPING_NOTE': IDL.Null,
        'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'GENERIC': IDL.Null,
        'CARGO_COLLECTION_ORDER': IDL.Null,
        'BOOKING_CONFIRMATION': IDL.Null,
        'BILL_OF_LADING': IDL.Null,
        'TRANSPORT_CONTRACT': IDL.Null,
        'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
        'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
        'EXPORT_INVOICE': IDL.Null,
        'ORIGIN_CERTIFICATE_ICO': IDL.Null,
        'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
        'SERVICE_GUIDE': IDL.Null,
        'WEIGHT_CERTIFICATE': IDL.Null,
        'EXPORT_CONFIRMATION': IDL.Null
      }), IDL.Vec(IDL.Record({
        'id': IDL.Nat,
        'documentType': IDL.Variant({
          'PRE_SHIPMENT_SAMPLE': IDL.Null,
          'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'SHIPPING_INSTRUCTIONS': IDL.Null,
          'PHYTOSANITARY_CERTIFICATE': IDL.Null,
          'SHIPPING_NOTE': IDL.Null,
          'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'GENERIC': IDL.Null,
          'CARGO_COLLECTION_ORDER': IDL.Null,
          'BOOKING_CONFIRMATION': IDL.Null,
          'BILL_OF_LADING': IDL.Null,
          'TRANSPORT_CONTRACT': IDL.Null,
          'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
          'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
          'EXPORT_INVOICE': IDL.Null,
          'ORIGIN_CERTIFICATE_ICO': IDL.Null,
          'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
          'SERVICE_GUIDE': IDL.Null,
          'WEIGHT_CERTIFICATE': IDL.Null,
          'EXPORT_CONFIRMATION': IDL.Null
        }),
        'externalUrl': IDL.Text,
        'evaluationStatus': IDL.Variant({
          'NOT_APPROVED': IDL.Null,
          'NOT_EVALUATED': IDL.Null,
          'APPROVED': IDL.Null
        }),
        'uploadedBy': IDL.Text
      })))),
      'qualityEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'fundsStatus': IDL.Variant({
        'LOCKED': IDL.Null,
        'RELEASED': IDL.Null,
        'NOT_LOCKED': IDL.Null
      }),
      'supplier': IDL.Text,
      'netWeight': IDL.Nat,
      'fixingDate': IDL.Int,
      'detailsSet': IDL.Bool,
      'containersNumber': IDL.Nat,
      'shipmentNumber': IDL.Nat,
      'grossWeight': IDL.Nat,
      'expirationDate': IDL.Int,
      'quantity': IDL.Nat,
      'sampleEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'differentialApplied': IDL.Nat,
      'price': IDL.Nat,
      'targetExchange': IDL.Text,
      'commissioner': IDL.Text,
      'detailsEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'escrowAddress': IDL.Opt(IDL.Text)
    })], []),
    'authenticate': IDL.Func([IDL.Record({
      'delegateCredentialIdHash': IDL.Text,
      'delegateCredentialExpiryDate': IDL.Nat,
      'role': IDL.Text,
      'signer': IDL.Text,
      'membershipProof': IDL.Record({
        'issuer': IDL.Text,
        'delegatorCredentialIdHash': IDL.Text,
        'delegatorCredentialExpiryDate': IDL.Nat,
        'signedProof': IDL.Text,
        'delegatorAddress': IDL.Text
      }),
      'signedProof': IDL.Text
    })], [], []),
    'createMaterial': IDL.Func([IDL.Nat], [IDL.Record({
      'id': IDL.Nat,
      'productCategory': IDL.Record({
        'id': IDL.Nat,
        'quality': IDL.Nat,
        'name': IDL.Text,
        'description': IDL.Text
      })
    })], []),
    'createOffer': IDL.Func([IDL.Nat], [IDL.Record({
      'id': IDL.Nat,
      'productCategory': IDL.Record({
        'id': IDL.Nat,
        'quality': IDL.Nat,
        'name': IDL.Text,
        'description': IDL.Text
      }),
      'owner': IDL.Text
    })], []),
    'createOrder': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Vec(IDL.Record({
      'productCategoryId': IDL.Nat,
      'unit': IDL.Text,
      'quantity': IDL.Float32,
      'price': IDL.Record({
        'fiat': IDL.Text,
        'amount': IDL.Float32
      })
    }))], [IDL.Record({
      'id': IDL.Nat,
      'shipper': IDL.Text,
      'status': IDL.Variant({
        'EXPIRED': IDL.Null,
        'PENDING': IDL.Null,
        'CONFIRMED': IDL.Null
      }),
      'arbiter': IDL.Text,
      'deliveryDeadline': IDL.Nat,
      'token': IDL.Text,
      'customer': IDL.Text,
      'paymentDeadline': IDL.Nat,
      'supplier': IDL.Text,
      'deliveryPort': IDL.Text,
      'lines': IDL.Vec(IDL.Record({
        'productCategory': IDL.Record({
          'id': IDL.Nat,
          'quality': IDL.Nat,
          'name': IDL.Text,
          'description': IDL.Text
        }),
        'unit': IDL.Text,
        'quantity': IDL.Float32,
        'price': IDL.Record({
          'fiat': IDL.Text,
          'amount': IDL.Float32
        })
      })),
      'agreedAmount': IDL.Nat,
      'incoterms': IDL.Text,
      'shippingPort': IDL.Text,
      'signatures': IDL.Vec(IDL.Text),
      'shippingDeadline': IDL.Nat,
      'shipmentId': IDL.Opt(IDL.Nat),
      'commissioner': IDL.Text,
      'documentDeliveryDeadline': IDL.Nat
    })], []),
    'createOrganization': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Variant({
      'EXPORTER': IDL.Null,
      'IMPORTER': IDL.Null,
      'ARBITER': IDL.Null
    }), IDL.Text, IDL.Text, IDL.Text], [IDL.Record({
      'region': IDL.Opt(IDL.Text),
      'ethAddress': IDL.Text,
      'city': IDL.Opt(IDL.Text),
      'postalCode': IDL.Opt(IDL.Text),
      'role': IDL.Opt(IDL.Variant({
        'EXPORTER': IDL.Null,
        'IMPORTER': IDL.Null,
        'ARBITER': IDL.Null
      })),
      'email': IDL.Opt(IDL.Text),
      'legalName': IDL.Text,
      'countryCode': IDL.Opt(IDL.Text),
      'industrialSector': IDL.Opt(IDL.Text),
      'address': IDL.Opt(IDL.Text),
      'visibilityLevel': IDL.Variant({
        'BROAD': IDL.Null,
        'NARROW': IDL.Null
      }),
      'image': IDL.Opt(IDL.Text),
      'telephone': IDL.Opt(IDL.Text)
    })], []),
    'createProductCategory': IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [IDL.Record({
      'id': IDL.Nat,
      'quality': IDL.Nat,
      'name': IDL.Text,
      'description': IDL.Text
    })], []),
    'deleteOrder': IDL.Func([IDL.Nat], [IDL.Bool], []),
    'deleteOrganization': IDL.Func([IDL.Text], [IDL.Bool], []),
    'deleteProductCategory': IDL.Func([IDL.Nat], [IDL.Bool], []),
    'depositFunds': IDL.Func([IDL.Nat, IDL.Nat], [IDL.Record({
      'id': IDL.Nat,
      'sampleApprovalRequired': IDL.Bool,
      'documents': IDL.Vec(IDL.Tuple(IDL.Variant({
        'PRE_SHIPMENT_SAMPLE': IDL.Null,
        'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'SHIPPING_INSTRUCTIONS': IDL.Null,
        'PHYTOSANITARY_CERTIFICATE': IDL.Null,
        'SHIPPING_NOTE': IDL.Null,
        'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'GENERIC': IDL.Null,
        'CARGO_COLLECTION_ORDER': IDL.Null,
        'BOOKING_CONFIRMATION': IDL.Null,
        'BILL_OF_LADING': IDL.Null,
        'TRANSPORT_CONTRACT': IDL.Null,
        'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
        'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
        'EXPORT_INVOICE': IDL.Null,
        'ORIGIN_CERTIFICATE_ICO': IDL.Null,
        'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
        'SERVICE_GUIDE': IDL.Null,
        'WEIGHT_CERTIFICATE': IDL.Null,
        'EXPORT_CONFIRMATION': IDL.Null
      }), IDL.Vec(IDL.Record({
        'id': IDL.Nat,
        'documentType': IDL.Variant({
          'PRE_SHIPMENT_SAMPLE': IDL.Null,
          'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'SHIPPING_INSTRUCTIONS': IDL.Null,
          'PHYTOSANITARY_CERTIFICATE': IDL.Null,
          'SHIPPING_NOTE': IDL.Null,
          'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'GENERIC': IDL.Null,
          'CARGO_COLLECTION_ORDER': IDL.Null,
          'BOOKING_CONFIRMATION': IDL.Null,
          'BILL_OF_LADING': IDL.Null,
          'TRANSPORT_CONTRACT': IDL.Null,
          'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
          'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
          'EXPORT_INVOICE': IDL.Null,
          'ORIGIN_CERTIFICATE_ICO': IDL.Null,
          'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
          'SERVICE_GUIDE': IDL.Null,
          'WEIGHT_CERTIFICATE': IDL.Null,
          'EXPORT_CONFIRMATION': IDL.Null
        }),
        'externalUrl': IDL.Text,
        'evaluationStatus': IDL.Variant({
          'NOT_APPROVED': IDL.Null,
          'NOT_EVALUATED': IDL.Null,
          'APPROVED': IDL.Null
        }),
        'uploadedBy': IDL.Text
      })))),
      'qualityEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'fundsStatus': IDL.Variant({
        'LOCKED': IDL.Null,
        'RELEASED': IDL.Null,
        'NOT_LOCKED': IDL.Null
      }),
      'supplier': IDL.Text,
      'netWeight': IDL.Nat,
      'fixingDate': IDL.Int,
      'detailsSet': IDL.Bool,
      'containersNumber': IDL.Nat,
      'shipmentNumber': IDL.Nat,
      'grossWeight': IDL.Nat,
      'expirationDate': IDL.Int,
      'quantity': IDL.Nat,
      'sampleEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'differentialApplied': IDL.Nat,
      'price': IDL.Nat,
      'targetExchange': IDL.Text,
      'commissioner': IDL.Text,
      'detailsEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'escrowAddress': IDL.Opt(IDL.Text)
    })], []),
    'determineEscrowAddress': IDL.Func([IDL.Nat], [IDL.Record({
      'id': IDL.Nat,
      'sampleApprovalRequired': IDL.Bool,
      'documents': IDL.Vec(IDL.Tuple(IDL.Variant({
        'PRE_SHIPMENT_SAMPLE': IDL.Null,
        'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'SHIPPING_INSTRUCTIONS': IDL.Null,
        'PHYTOSANITARY_CERTIFICATE': IDL.Null,
        'SHIPPING_NOTE': IDL.Null,
        'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'GENERIC': IDL.Null,
        'CARGO_COLLECTION_ORDER': IDL.Null,
        'BOOKING_CONFIRMATION': IDL.Null,
        'BILL_OF_LADING': IDL.Null,
        'TRANSPORT_CONTRACT': IDL.Null,
        'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
        'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
        'EXPORT_INVOICE': IDL.Null,
        'ORIGIN_CERTIFICATE_ICO': IDL.Null,
        'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
        'SERVICE_GUIDE': IDL.Null,
        'WEIGHT_CERTIFICATE': IDL.Null,
        'EXPORT_CONFIRMATION': IDL.Null
      }), IDL.Vec(IDL.Record({
        'id': IDL.Nat,
        'documentType': IDL.Variant({
          'PRE_SHIPMENT_SAMPLE': IDL.Null,
          'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'SHIPPING_INSTRUCTIONS': IDL.Null,
          'PHYTOSANITARY_CERTIFICATE': IDL.Null,
          'SHIPPING_NOTE': IDL.Null,
          'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'GENERIC': IDL.Null,
          'CARGO_COLLECTION_ORDER': IDL.Null,
          'BOOKING_CONFIRMATION': IDL.Null,
          'BILL_OF_LADING': IDL.Null,
          'TRANSPORT_CONTRACT': IDL.Null,
          'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
          'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
          'EXPORT_INVOICE': IDL.Null,
          'ORIGIN_CERTIFICATE_ICO': IDL.Null,
          'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
          'SERVICE_GUIDE': IDL.Null,
          'WEIGHT_CERTIFICATE': IDL.Null,
          'EXPORT_CONFIRMATION': IDL.Null
        }),
        'externalUrl': IDL.Text,
        'evaluationStatus': IDL.Variant({
          'NOT_APPROVED': IDL.Null,
          'NOT_EVALUATED': IDL.Null,
          'APPROVED': IDL.Null
        }),
        'uploadedBy': IDL.Text
      })))),
      'qualityEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'fundsStatus': IDL.Variant({
        'LOCKED': IDL.Null,
        'RELEASED': IDL.Null,
        'NOT_LOCKED': IDL.Null
      }),
      'supplier': IDL.Text,
      'netWeight': IDL.Nat,
      'fixingDate': IDL.Int,
      'detailsSet': IDL.Bool,
      'containersNumber': IDL.Nat,
      'shipmentNumber': IDL.Nat,
      'grossWeight': IDL.Nat,
      'expirationDate': IDL.Int,
      'quantity': IDL.Nat,
      'sampleEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'differentialApplied': IDL.Nat,
      'price': IDL.Nat,
      'targetExchange': IDL.Text,
      'commissioner': IDL.Text,
      'detailsEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'escrowAddress': IDL.Opt(IDL.Text)
    })], []),
    'evaluateDocument': IDL.Func([IDL.Nat, IDL.Nat, IDL.Variant({
      'NOT_APPROVED': IDL.Null,
      'NOT_EVALUATED': IDL.Null,
      'APPROVED': IDL.Null
    })], [IDL.Record({
      'id': IDL.Nat,
      'sampleApprovalRequired': IDL.Bool,
      'documents': IDL.Vec(IDL.Tuple(IDL.Variant({
        'PRE_SHIPMENT_SAMPLE': IDL.Null,
        'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'SHIPPING_INSTRUCTIONS': IDL.Null,
        'PHYTOSANITARY_CERTIFICATE': IDL.Null,
        'SHIPPING_NOTE': IDL.Null,
        'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'GENERIC': IDL.Null,
        'CARGO_COLLECTION_ORDER': IDL.Null,
        'BOOKING_CONFIRMATION': IDL.Null,
        'BILL_OF_LADING': IDL.Null,
        'TRANSPORT_CONTRACT': IDL.Null,
        'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
        'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
        'EXPORT_INVOICE': IDL.Null,
        'ORIGIN_CERTIFICATE_ICO': IDL.Null,
        'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
        'SERVICE_GUIDE': IDL.Null,
        'WEIGHT_CERTIFICATE': IDL.Null,
        'EXPORT_CONFIRMATION': IDL.Null
      }), IDL.Vec(IDL.Record({
        'id': IDL.Nat,
        'documentType': IDL.Variant({
          'PRE_SHIPMENT_SAMPLE': IDL.Null,
          'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'SHIPPING_INSTRUCTIONS': IDL.Null,
          'PHYTOSANITARY_CERTIFICATE': IDL.Null,
          'SHIPPING_NOTE': IDL.Null,
          'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'GENERIC': IDL.Null,
          'CARGO_COLLECTION_ORDER': IDL.Null,
          'BOOKING_CONFIRMATION': IDL.Null,
          'BILL_OF_LADING': IDL.Null,
          'TRANSPORT_CONTRACT': IDL.Null,
          'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
          'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
          'EXPORT_INVOICE': IDL.Null,
          'ORIGIN_CERTIFICATE_ICO': IDL.Null,
          'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
          'SERVICE_GUIDE': IDL.Null,
          'WEIGHT_CERTIFICATE': IDL.Null,
          'EXPORT_CONFIRMATION': IDL.Null
        }),
        'externalUrl': IDL.Text,
        'evaluationStatus': IDL.Variant({
          'NOT_APPROVED': IDL.Null,
          'NOT_EVALUATED': IDL.Null,
          'APPROVED': IDL.Null
        }),
        'uploadedBy': IDL.Text
      })))),
      'qualityEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'fundsStatus': IDL.Variant({
        'LOCKED': IDL.Null,
        'RELEASED': IDL.Null,
        'NOT_LOCKED': IDL.Null
      }),
      'supplier': IDL.Text,
      'netWeight': IDL.Nat,
      'fixingDate': IDL.Int,
      'detailsSet': IDL.Bool,
      'containersNumber': IDL.Nat,
      'shipmentNumber': IDL.Nat,
      'grossWeight': IDL.Nat,
      'expirationDate': IDL.Int,
      'quantity': IDL.Nat,
      'sampleEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'differentialApplied': IDL.Nat,
      'price': IDL.Nat,
      'targetExchange': IDL.Text,
      'commissioner': IDL.Text,
      'detailsEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'escrowAddress': IDL.Opt(IDL.Text)
    })], []),
    'evaluateQuality': IDL.Func([IDL.Nat, IDL.Variant({
      'NOT_APPROVED': IDL.Null,
      'NOT_EVALUATED': IDL.Null,
      'APPROVED': IDL.Null
    })], [IDL.Record({
      'id': IDL.Nat,
      'sampleApprovalRequired': IDL.Bool,
      'documents': IDL.Vec(IDL.Tuple(IDL.Variant({
        'PRE_SHIPMENT_SAMPLE': IDL.Null,
        'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'SHIPPING_INSTRUCTIONS': IDL.Null,
        'PHYTOSANITARY_CERTIFICATE': IDL.Null,
        'SHIPPING_NOTE': IDL.Null,
        'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'GENERIC': IDL.Null,
        'CARGO_COLLECTION_ORDER': IDL.Null,
        'BOOKING_CONFIRMATION': IDL.Null,
        'BILL_OF_LADING': IDL.Null,
        'TRANSPORT_CONTRACT': IDL.Null,
        'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
        'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
        'EXPORT_INVOICE': IDL.Null,
        'ORIGIN_CERTIFICATE_ICO': IDL.Null,
        'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
        'SERVICE_GUIDE': IDL.Null,
        'WEIGHT_CERTIFICATE': IDL.Null,
        'EXPORT_CONFIRMATION': IDL.Null
      }), IDL.Vec(IDL.Record({
        'id': IDL.Nat,
        'documentType': IDL.Variant({
          'PRE_SHIPMENT_SAMPLE': IDL.Null,
          'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'SHIPPING_INSTRUCTIONS': IDL.Null,
          'PHYTOSANITARY_CERTIFICATE': IDL.Null,
          'SHIPPING_NOTE': IDL.Null,
          'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'GENERIC': IDL.Null,
          'CARGO_COLLECTION_ORDER': IDL.Null,
          'BOOKING_CONFIRMATION': IDL.Null,
          'BILL_OF_LADING': IDL.Null,
          'TRANSPORT_CONTRACT': IDL.Null,
          'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
          'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
          'EXPORT_INVOICE': IDL.Null,
          'ORIGIN_CERTIFICATE_ICO': IDL.Null,
          'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
          'SERVICE_GUIDE': IDL.Null,
          'WEIGHT_CERTIFICATE': IDL.Null,
          'EXPORT_CONFIRMATION': IDL.Null
        }),
        'externalUrl': IDL.Text,
        'evaluationStatus': IDL.Variant({
          'NOT_APPROVED': IDL.Null,
          'NOT_EVALUATED': IDL.Null,
          'APPROVED': IDL.Null
        }),
        'uploadedBy': IDL.Text
      })))),
      'qualityEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'fundsStatus': IDL.Variant({
        'LOCKED': IDL.Null,
        'RELEASED': IDL.Null,
        'NOT_LOCKED': IDL.Null
      }),
      'supplier': IDL.Text,
      'netWeight': IDL.Nat,
      'fixingDate': IDL.Int,
      'detailsSet': IDL.Bool,
      'containersNumber': IDL.Nat,
      'shipmentNumber': IDL.Nat,
      'grossWeight': IDL.Nat,
      'expirationDate': IDL.Int,
      'quantity': IDL.Nat,
      'sampleEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'differentialApplied': IDL.Nat,
      'price': IDL.Nat,
      'targetExchange': IDL.Text,
      'commissioner': IDL.Text,
      'detailsEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'escrowAddress': IDL.Opt(IDL.Text)
    })], []),
    'evaluateSample': IDL.Func([IDL.Nat, IDL.Variant({
      'NOT_APPROVED': IDL.Null,
      'NOT_EVALUATED': IDL.Null,
      'APPROVED': IDL.Null
    })], [IDL.Record({
      'id': IDL.Nat,
      'sampleApprovalRequired': IDL.Bool,
      'documents': IDL.Vec(IDL.Tuple(IDL.Variant({
        'PRE_SHIPMENT_SAMPLE': IDL.Null,
        'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'SHIPPING_INSTRUCTIONS': IDL.Null,
        'PHYTOSANITARY_CERTIFICATE': IDL.Null,
        'SHIPPING_NOTE': IDL.Null,
        'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'GENERIC': IDL.Null,
        'CARGO_COLLECTION_ORDER': IDL.Null,
        'BOOKING_CONFIRMATION': IDL.Null,
        'BILL_OF_LADING': IDL.Null,
        'TRANSPORT_CONTRACT': IDL.Null,
        'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
        'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
        'EXPORT_INVOICE': IDL.Null,
        'ORIGIN_CERTIFICATE_ICO': IDL.Null,
        'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
        'SERVICE_GUIDE': IDL.Null,
        'WEIGHT_CERTIFICATE': IDL.Null,
        'EXPORT_CONFIRMATION': IDL.Null
      }), IDL.Vec(IDL.Record({
        'id': IDL.Nat,
        'documentType': IDL.Variant({
          'PRE_SHIPMENT_SAMPLE': IDL.Null,
          'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'SHIPPING_INSTRUCTIONS': IDL.Null,
          'PHYTOSANITARY_CERTIFICATE': IDL.Null,
          'SHIPPING_NOTE': IDL.Null,
          'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'GENERIC': IDL.Null,
          'CARGO_COLLECTION_ORDER': IDL.Null,
          'BOOKING_CONFIRMATION': IDL.Null,
          'BILL_OF_LADING': IDL.Null,
          'TRANSPORT_CONTRACT': IDL.Null,
          'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
          'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
          'EXPORT_INVOICE': IDL.Null,
          'ORIGIN_CERTIFICATE_ICO': IDL.Null,
          'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
          'SERVICE_GUIDE': IDL.Null,
          'WEIGHT_CERTIFICATE': IDL.Null,
          'EXPORT_CONFIRMATION': IDL.Null
        }),
        'externalUrl': IDL.Text,
        'evaluationStatus': IDL.Variant({
          'NOT_APPROVED': IDL.Null,
          'NOT_EVALUATED': IDL.Null,
          'APPROVED': IDL.Null
        }),
        'uploadedBy': IDL.Text
      })))),
      'qualityEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'fundsStatus': IDL.Variant({
        'LOCKED': IDL.Null,
        'RELEASED': IDL.Null,
        'NOT_LOCKED': IDL.Null
      }),
      'supplier': IDL.Text,
      'netWeight': IDL.Nat,
      'fixingDate': IDL.Int,
      'detailsSet': IDL.Bool,
      'containersNumber': IDL.Nat,
      'shipmentNumber': IDL.Nat,
      'grossWeight': IDL.Nat,
      'expirationDate': IDL.Int,
      'quantity': IDL.Nat,
      'sampleEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'differentialApplied': IDL.Nat,
      'price': IDL.Nat,
      'targetExchange': IDL.Text,
      'commissioner': IDL.Text,
      'detailsEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'escrowAddress': IDL.Opt(IDL.Text)
    })], []),
    'evaluateShipmentDetails': IDL.Func([IDL.Nat, IDL.Variant({
      'NOT_APPROVED': IDL.Null,
      'NOT_EVALUATED': IDL.Null,
      'APPROVED': IDL.Null
    })], [IDL.Record({
      'id': IDL.Nat,
      'sampleApprovalRequired': IDL.Bool,
      'documents': IDL.Vec(IDL.Tuple(IDL.Variant({
        'PRE_SHIPMENT_SAMPLE': IDL.Null,
        'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'SHIPPING_INSTRUCTIONS': IDL.Null,
        'PHYTOSANITARY_CERTIFICATE': IDL.Null,
        'SHIPPING_NOTE': IDL.Null,
        'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'GENERIC': IDL.Null,
        'CARGO_COLLECTION_ORDER': IDL.Null,
        'BOOKING_CONFIRMATION': IDL.Null,
        'BILL_OF_LADING': IDL.Null,
        'TRANSPORT_CONTRACT': IDL.Null,
        'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
        'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
        'EXPORT_INVOICE': IDL.Null,
        'ORIGIN_CERTIFICATE_ICO': IDL.Null,
        'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
        'SERVICE_GUIDE': IDL.Null,
        'WEIGHT_CERTIFICATE': IDL.Null,
        'EXPORT_CONFIRMATION': IDL.Null
      }), IDL.Vec(IDL.Record({
        'id': IDL.Nat,
        'documentType': IDL.Variant({
          'PRE_SHIPMENT_SAMPLE': IDL.Null,
          'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'SHIPPING_INSTRUCTIONS': IDL.Null,
          'PHYTOSANITARY_CERTIFICATE': IDL.Null,
          'SHIPPING_NOTE': IDL.Null,
          'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'GENERIC': IDL.Null,
          'CARGO_COLLECTION_ORDER': IDL.Null,
          'BOOKING_CONFIRMATION': IDL.Null,
          'BILL_OF_LADING': IDL.Null,
          'TRANSPORT_CONTRACT': IDL.Null,
          'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
          'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
          'EXPORT_INVOICE': IDL.Null,
          'ORIGIN_CERTIFICATE_ICO': IDL.Null,
          'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
          'SERVICE_GUIDE': IDL.Null,
          'WEIGHT_CERTIFICATE': IDL.Null,
          'EXPORT_CONFIRMATION': IDL.Null
        }),
        'externalUrl': IDL.Text,
        'evaluationStatus': IDL.Variant({
          'NOT_APPROVED': IDL.Null,
          'NOT_EVALUATED': IDL.Null,
          'APPROVED': IDL.Null
        }),
        'uploadedBy': IDL.Text
      })))),
      'qualityEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'fundsStatus': IDL.Variant({
        'LOCKED': IDL.Null,
        'RELEASED': IDL.Null,
        'NOT_LOCKED': IDL.Null
      }),
      'supplier': IDL.Text,
      'netWeight': IDL.Nat,
      'fixingDate': IDL.Int,
      'detailsSet': IDL.Bool,
      'containersNumber': IDL.Nat,
      'shipmentNumber': IDL.Nat,
      'grossWeight': IDL.Nat,
      'expirationDate': IDL.Int,
      'quantity': IDL.Nat,
      'sampleEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'differentialApplied': IDL.Nat,
      'price': IDL.Nat,
      'targetExchange': IDL.Text,
      'commissioner': IDL.Text,
      'detailsEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'escrowAddress': IDL.Opt(IDL.Text)
    })], []),
    'getCanisterAddress': IDL.Func([], [IDL.Text], []),
    'getDocument': IDL.Func([IDL.Nat, IDL.Nat], [IDL.Record({
      'id': IDL.Nat,
      'documentType': IDL.Variant({
        'PRE_SHIPMENT_SAMPLE': IDL.Null,
        'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'SHIPPING_INSTRUCTIONS': IDL.Null,
        'PHYTOSANITARY_CERTIFICATE': IDL.Null,
        'SHIPPING_NOTE': IDL.Null,
        'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'GENERIC': IDL.Null,
        'CARGO_COLLECTION_ORDER': IDL.Null,
        'BOOKING_CONFIRMATION': IDL.Null,
        'BILL_OF_LADING': IDL.Null,
        'TRANSPORT_CONTRACT': IDL.Null,
        'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
        'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
        'EXPORT_INVOICE': IDL.Null,
        'ORIGIN_CERTIFICATE_ICO': IDL.Null,
        'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
        'SERVICE_GUIDE': IDL.Null,
        'WEIGHT_CERTIFICATE': IDL.Null,
        'EXPORT_CONFIRMATION': IDL.Null
      }),
      'externalUrl': IDL.Text,
      'evaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'uploadedBy': IDL.Text
    })], ['query']),
    'getDocuments': IDL.Func([IDL.Nat], [IDL.Vec(IDL.Tuple(IDL.Variant({
      'PRE_SHIPMENT_SAMPLE': IDL.Null,
      'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'SHIPPING_INSTRUCTIONS': IDL.Null,
      'PHYTOSANITARY_CERTIFICATE': IDL.Null,
      'SHIPPING_NOTE': IDL.Null,
      'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'GENERIC': IDL.Null,
      'CARGO_COLLECTION_ORDER': IDL.Null,
      'BOOKING_CONFIRMATION': IDL.Null,
      'BILL_OF_LADING': IDL.Null,
      'TRANSPORT_CONTRACT': IDL.Null,
      'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
      'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
      'EXPORT_INVOICE': IDL.Null,
      'ORIGIN_CERTIFICATE_ICO': IDL.Null,
      'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
      'SERVICE_GUIDE': IDL.Null,
      'WEIGHT_CERTIFICATE': IDL.Null,
      'EXPORT_CONFIRMATION': IDL.Null
    }), IDL.Vec(IDL.Record({
      'id': IDL.Nat,
      'documentType': IDL.Variant({
        'PRE_SHIPMENT_SAMPLE': IDL.Null,
        'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'SHIPPING_INSTRUCTIONS': IDL.Null,
        'PHYTOSANITARY_CERTIFICATE': IDL.Null,
        'SHIPPING_NOTE': IDL.Null,
        'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'GENERIC': IDL.Null,
        'CARGO_COLLECTION_ORDER': IDL.Null,
        'BOOKING_CONFIRMATION': IDL.Null,
        'BILL_OF_LADING': IDL.Null,
        'TRANSPORT_CONTRACT': IDL.Null,
        'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
        'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
        'EXPORT_INVOICE': IDL.Null,
        'ORIGIN_CERTIFICATE_ICO': IDL.Null,
        'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
        'SERVICE_GUIDE': IDL.Null,
        'WEIGHT_CERTIFICATE': IDL.Null,
        'EXPORT_CONFIRMATION': IDL.Null
      }),
      'externalUrl': IDL.Text,
      'evaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'uploadedBy': IDL.Text
    }))))], ['query']),
    'getDocumentsByType': IDL.Func([IDL.Nat, IDL.Variant({
      'PRE_SHIPMENT_SAMPLE': IDL.Null,
      'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'SHIPPING_INSTRUCTIONS': IDL.Null,
      'PHYTOSANITARY_CERTIFICATE': IDL.Null,
      'SHIPPING_NOTE': IDL.Null,
      'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'GENERIC': IDL.Null,
      'CARGO_COLLECTION_ORDER': IDL.Null,
      'BOOKING_CONFIRMATION': IDL.Null,
      'BILL_OF_LADING': IDL.Null,
      'TRANSPORT_CONTRACT': IDL.Null,
      'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
      'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
      'EXPORT_INVOICE': IDL.Null,
      'ORIGIN_CERTIFICATE_ICO': IDL.Null,
      'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
      'SERVICE_GUIDE': IDL.Null,
      'WEIGHT_CERTIFICATE': IDL.Null,
      'EXPORT_CONFIRMATION': IDL.Null
    })], [IDL.Vec(IDL.Record({
      'id': IDL.Nat,
      'documentType': IDL.Variant({
        'PRE_SHIPMENT_SAMPLE': IDL.Null,
        'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'SHIPPING_INSTRUCTIONS': IDL.Null,
        'PHYTOSANITARY_CERTIFICATE': IDL.Null,
        'SHIPPING_NOTE': IDL.Null,
        'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'GENERIC': IDL.Null,
        'CARGO_COLLECTION_ORDER': IDL.Null,
        'BOOKING_CONFIRMATION': IDL.Null,
        'BILL_OF_LADING': IDL.Null,
        'TRANSPORT_CONTRACT': IDL.Null,
        'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
        'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
        'EXPORT_INVOICE': IDL.Null,
        'ORIGIN_CERTIFICATE_ICO': IDL.Null,
        'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
        'SERVICE_GUIDE': IDL.Null,
        'WEIGHT_CERTIFICATE': IDL.Null,
        'EXPORT_CONFIRMATION': IDL.Null
      }),
      'externalUrl': IDL.Text,
      'evaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'uploadedBy': IDL.Text
    }))], ['query']),
    'getMaterial': IDL.Func([IDL.Nat], [IDL.Record({
      'id': IDL.Nat,
      'productCategory': IDL.Record({
        'id': IDL.Nat,
        'quality': IDL.Nat,
        'name': IDL.Text,
        'description': IDL.Text
      })
    })], ['query']),
    'getMaterials': IDL.Func([], [IDL.Vec(IDL.Record({
      'id': IDL.Nat,
      'productCategory': IDL.Record({
        'id': IDL.Nat,
        'quality': IDL.Nat,
        'name': IDL.Text,
        'description': IDL.Text
      })
    }))], ['query']),
    'getOffer': IDL.Func([IDL.Nat], [IDL.Record({
      'id': IDL.Nat,
      'productCategory': IDL.Record({
        'id': IDL.Nat,
        'quality': IDL.Nat,
        'name': IDL.Text,
        'description': IDL.Text
      }),
      'owner': IDL.Text
    })], ['query']),
    'getOffers': IDL.Func([], [IDL.Vec(IDL.Record({
      'id': IDL.Nat,
      'productCategory': IDL.Record({
        'id': IDL.Nat,
        'quality': IDL.Nat,
        'name': IDL.Text,
        'description': IDL.Text
      }),
      'owner': IDL.Text
    }))], ['query']),
    'getOrder': IDL.Func([IDL.Nat], [IDL.Record({
      'id': IDL.Nat,
      'shipper': IDL.Text,
      'status': IDL.Variant({
        'EXPIRED': IDL.Null,
        'PENDING': IDL.Null,
        'CONFIRMED': IDL.Null
      }),
      'arbiter': IDL.Text,
      'deliveryDeadline': IDL.Nat,
      'token': IDL.Text,
      'customer': IDL.Text,
      'paymentDeadline': IDL.Nat,
      'supplier': IDL.Text,
      'deliveryPort': IDL.Text,
      'lines': IDL.Vec(IDL.Record({
        'productCategory': IDL.Record({
          'id': IDL.Nat,
          'quality': IDL.Nat,
          'name': IDL.Text,
          'description': IDL.Text
        }),
        'unit': IDL.Text,
        'quantity': IDL.Float32,
        'price': IDL.Record({
          'fiat': IDL.Text,
          'amount': IDL.Float32
        })
      })),
      'agreedAmount': IDL.Nat,
      'incoterms': IDL.Text,
      'shippingPort': IDL.Text,
      'signatures': IDL.Vec(IDL.Text),
      'shippingDeadline': IDL.Nat,
      'shipmentId': IDL.Opt(IDL.Nat),
      'commissioner': IDL.Text,
      'documentDeliveryDeadline': IDL.Nat
    })], ['query']),
    'getOrders': IDL.Func([], [IDL.Vec(IDL.Record({
      'id': IDL.Nat,
      'shipper': IDL.Text,
      'status': IDL.Variant({
        'EXPIRED': IDL.Null,
        'PENDING': IDL.Null,
        'CONFIRMED': IDL.Null
      }),
      'arbiter': IDL.Text,
      'deliveryDeadline': IDL.Nat,
      'token': IDL.Text,
      'customer': IDL.Text,
      'paymentDeadline': IDL.Nat,
      'supplier': IDL.Text,
      'deliveryPort': IDL.Text,
      'lines': IDL.Vec(IDL.Record({
        'productCategory': IDL.Record({
          'id': IDL.Nat,
          'quality': IDL.Nat,
          'name': IDL.Text,
          'description': IDL.Text
        }),
        'unit': IDL.Text,
        'quantity': IDL.Float32,
        'price': IDL.Record({
          'fiat': IDL.Text,
          'amount': IDL.Float32
        })
      })),
      'agreedAmount': IDL.Nat,
      'incoterms': IDL.Text,
      'shippingPort': IDL.Text,
      'signatures': IDL.Vec(IDL.Text),
      'shippingDeadline': IDL.Nat,
      'shipmentId': IDL.Opt(IDL.Nat),
      'commissioner': IDL.Text,
      'documentDeliveryDeadline': IDL.Nat
    }))], ['query']),
    'getOrganization': IDL.Func([IDL.Text], [IDL.Record({
      'region': IDL.Opt(IDL.Text),
      'ethAddress': IDL.Text,
      'city': IDL.Opt(IDL.Text),
      'postalCode': IDL.Opt(IDL.Text),
      'role': IDL.Opt(IDL.Variant({
        'EXPORTER': IDL.Null,
        'IMPORTER': IDL.Null,
        'ARBITER': IDL.Null
      })),
      'email': IDL.Opt(IDL.Text),
      'legalName': IDL.Text,
      'countryCode': IDL.Opt(IDL.Text),
      'industrialSector': IDL.Opt(IDL.Text),
      'address': IDL.Opt(IDL.Text),
      'visibilityLevel': IDL.Variant({
        'BROAD': IDL.Null,
        'NARROW': IDL.Null
      }),
      'image': IDL.Opt(IDL.Text),
      'telephone': IDL.Opt(IDL.Text)
    })], ['query']),
    'getOrganizations': IDL.Func([], [IDL.Vec(IDL.Record({
      'region': IDL.Opt(IDL.Text),
      'ethAddress': IDL.Text,
      'city': IDL.Opt(IDL.Text),
      'postalCode': IDL.Opt(IDL.Text),
      'role': IDL.Opt(IDL.Variant({
        'EXPORTER': IDL.Null,
        'IMPORTER': IDL.Null,
        'ARBITER': IDL.Null
      })),
      'email': IDL.Opt(IDL.Text),
      'legalName': IDL.Text,
      'countryCode': IDL.Opt(IDL.Text),
      'industrialSector': IDL.Opt(IDL.Text),
      'address': IDL.Opt(IDL.Text),
      'visibilityLevel': IDL.Variant({
        'BROAD': IDL.Null,
        'NARROW': IDL.Null
      }),
      'image': IDL.Opt(IDL.Text),
      'telephone': IDL.Opt(IDL.Text)
    }))], ['query']),
    'getPhase1Documents': IDL.Func([], [IDL.Vec(IDL.Variant({
      'PRE_SHIPMENT_SAMPLE': IDL.Null,
      'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'SHIPPING_INSTRUCTIONS': IDL.Null,
      'PHYTOSANITARY_CERTIFICATE': IDL.Null,
      'SHIPPING_NOTE': IDL.Null,
      'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'GENERIC': IDL.Null,
      'CARGO_COLLECTION_ORDER': IDL.Null,
      'BOOKING_CONFIRMATION': IDL.Null,
      'BILL_OF_LADING': IDL.Null,
      'TRANSPORT_CONTRACT': IDL.Null,
      'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
      'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
      'EXPORT_INVOICE': IDL.Null,
      'ORIGIN_CERTIFICATE_ICO': IDL.Null,
      'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
      'SERVICE_GUIDE': IDL.Null,
      'WEIGHT_CERTIFICATE': IDL.Null,
      'EXPORT_CONFIRMATION': IDL.Null
    }))], ['query']),
    'getPhase1RequiredDocuments': IDL.Func([], [IDL.Vec(IDL.Variant({
      'PRE_SHIPMENT_SAMPLE': IDL.Null,
      'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'SHIPPING_INSTRUCTIONS': IDL.Null,
      'PHYTOSANITARY_CERTIFICATE': IDL.Null,
      'SHIPPING_NOTE': IDL.Null,
      'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'GENERIC': IDL.Null,
      'CARGO_COLLECTION_ORDER': IDL.Null,
      'BOOKING_CONFIRMATION': IDL.Null,
      'BILL_OF_LADING': IDL.Null,
      'TRANSPORT_CONTRACT': IDL.Null,
      'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
      'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
      'EXPORT_INVOICE': IDL.Null,
      'ORIGIN_CERTIFICATE_ICO': IDL.Null,
      'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
      'SERVICE_GUIDE': IDL.Null,
      'WEIGHT_CERTIFICATE': IDL.Null,
      'EXPORT_CONFIRMATION': IDL.Null
    }))], ['query']),
    'getPhase2Documents': IDL.Func([], [IDL.Vec(IDL.Variant({
      'PRE_SHIPMENT_SAMPLE': IDL.Null,
      'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'SHIPPING_INSTRUCTIONS': IDL.Null,
      'PHYTOSANITARY_CERTIFICATE': IDL.Null,
      'SHIPPING_NOTE': IDL.Null,
      'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'GENERIC': IDL.Null,
      'CARGO_COLLECTION_ORDER': IDL.Null,
      'BOOKING_CONFIRMATION': IDL.Null,
      'BILL_OF_LADING': IDL.Null,
      'TRANSPORT_CONTRACT': IDL.Null,
      'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
      'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
      'EXPORT_INVOICE': IDL.Null,
      'ORIGIN_CERTIFICATE_ICO': IDL.Null,
      'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
      'SERVICE_GUIDE': IDL.Null,
      'WEIGHT_CERTIFICATE': IDL.Null,
      'EXPORT_CONFIRMATION': IDL.Null
    }))], ['query']),
    'getPhase2RequiredDocuments': IDL.Func([], [IDL.Vec(IDL.Variant({
      'PRE_SHIPMENT_SAMPLE': IDL.Null,
      'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'SHIPPING_INSTRUCTIONS': IDL.Null,
      'PHYTOSANITARY_CERTIFICATE': IDL.Null,
      'SHIPPING_NOTE': IDL.Null,
      'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'GENERIC': IDL.Null,
      'CARGO_COLLECTION_ORDER': IDL.Null,
      'BOOKING_CONFIRMATION': IDL.Null,
      'BILL_OF_LADING': IDL.Null,
      'TRANSPORT_CONTRACT': IDL.Null,
      'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
      'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
      'EXPORT_INVOICE': IDL.Null,
      'ORIGIN_CERTIFICATE_ICO': IDL.Null,
      'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
      'SERVICE_GUIDE': IDL.Null,
      'WEIGHT_CERTIFICATE': IDL.Null,
      'EXPORT_CONFIRMATION': IDL.Null
    }))], ['query']),
    'getPhase3Documents': IDL.Func([], [IDL.Vec(IDL.Variant({
      'PRE_SHIPMENT_SAMPLE': IDL.Null,
      'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'SHIPPING_INSTRUCTIONS': IDL.Null,
      'PHYTOSANITARY_CERTIFICATE': IDL.Null,
      'SHIPPING_NOTE': IDL.Null,
      'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'GENERIC': IDL.Null,
      'CARGO_COLLECTION_ORDER': IDL.Null,
      'BOOKING_CONFIRMATION': IDL.Null,
      'BILL_OF_LADING': IDL.Null,
      'TRANSPORT_CONTRACT': IDL.Null,
      'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
      'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
      'EXPORT_INVOICE': IDL.Null,
      'ORIGIN_CERTIFICATE_ICO': IDL.Null,
      'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
      'SERVICE_GUIDE': IDL.Null,
      'WEIGHT_CERTIFICATE': IDL.Null,
      'EXPORT_CONFIRMATION': IDL.Null
    }))], ['query']),
    'getPhase3RequiredDocuments': IDL.Func([], [IDL.Vec(IDL.Variant({
      'PRE_SHIPMENT_SAMPLE': IDL.Null,
      'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'SHIPPING_INSTRUCTIONS': IDL.Null,
      'PHYTOSANITARY_CERTIFICATE': IDL.Null,
      'SHIPPING_NOTE': IDL.Null,
      'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'GENERIC': IDL.Null,
      'CARGO_COLLECTION_ORDER': IDL.Null,
      'BOOKING_CONFIRMATION': IDL.Null,
      'BILL_OF_LADING': IDL.Null,
      'TRANSPORT_CONTRACT': IDL.Null,
      'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
      'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
      'EXPORT_INVOICE': IDL.Null,
      'ORIGIN_CERTIFICATE_ICO': IDL.Null,
      'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
      'SERVICE_GUIDE': IDL.Null,
      'WEIGHT_CERTIFICATE': IDL.Null,
      'EXPORT_CONFIRMATION': IDL.Null
    }))], ['query']),
    'getPhase4Documents': IDL.Func([], [IDL.Vec(IDL.Variant({
      'PRE_SHIPMENT_SAMPLE': IDL.Null,
      'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'SHIPPING_INSTRUCTIONS': IDL.Null,
      'PHYTOSANITARY_CERTIFICATE': IDL.Null,
      'SHIPPING_NOTE': IDL.Null,
      'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'GENERIC': IDL.Null,
      'CARGO_COLLECTION_ORDER': IDL.Null,
      'BOOKING_CONFIRMATION': IDL.Null,
      'BILL_OF_LADING': IDL.Null,
      'TRANSPORT_CONTRACT': IDL.Null,
      'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
      'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
      'EXPORT_INVOICE': IDL.Null,
      'ORIGIN_CERTIFICATE_ICO': IDL.Null,
      'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
      'SERVICE_GUIDE': IDL.Null,
      'WEIGHT_CERTIFICATE': IDL.Null,
      'EXPORT_CONFIRMATION': IDL.Null
    }))], ['query']),
    'getPhase4RequiredDocuments': IDL.Func([], [IDL.Vec(IDL.Variant({
      'PRE_SHIPMENT_SAMPLE': IDL.Null,
      'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'SHIPPING_INSTRUCTIONS': IDL.Null,
      'PHYTOSANITARY_CERTIFICATE': IDL.Null,
      'SHIPPING_NOTE': IDL.Null,
      'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'GENERIC': IDL.Null,
      'CARGO_COLLECTION_ORDER': IDL.Null,
      'BOOKING_CONFIRMATION': IDL.Null,
      'BILL_OF_LADING': IDL.Null,
      'TRANSPORT_CONTRACT': IDL.Null,
      'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
      'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
      'EXPORT_INVOICE': IDL.Null,
      'ORIGIN_CERTIFICATE_ICO': IDL.Null,
      'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
      'SERVICE_GUIDE': IDL.Null,
      'WEIGHT_CERTIFICATE': IDL.Null,
      'EXPORT_CONFIRMATION': IDL.Null
    }))], ['query']),
    'getPhase5Documents': IDL.Func([], [IDL.Vec(IDL.Variant({
      'PRE_SHIPMENT_SAMPLE': IDL.Null,
      'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'SHIPPING_INSTRUCTIONS': IDL.Null,
      'PHYTOSANITARY_CERTIFICATE': IDL.Null,
      'SHIPPING_NOTE': IDL.Null,
      'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'GENERIC': IDL.Null,
      'CARGO_COLLECTION_ORDER': IDL.Null,
      'BOOKING_CONFIRMATION': IDL.Null,
      'BILL_OF_LADING': IDL.Null,
      'TRANSPORT_CONTRACT': IDL.Null,
      'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
      'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
      'EXPORT_INVOICE': IDL.Null,
      'ORIGIN_CERTIFICATE_ICO': IDL.Null,
      'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
      'SERVICE_GUIDE': IDL.Null,
      'WEIGHT_CERTIFICATE': IDL.Null,
      'EXPORT_CONFIRMATION': IDL.Null
    }))], ['query']),
    'getPhase5RequiredDocuments': IDL.Func([], [IDL.Vec(IDL.Variant({
      'PRE_SHIPMENT_SAMPLE': IDL.Null,
      'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'SHIPPING_INSTRUCTIONS': IDL.Null,
      'PHYTOSANITARY_CERTIFICATE': IDL.Null,
      'SHIPPING_NOTE': IDL.Null,
      'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'GENERIC': IDL.Null,
      'CARGO_COLLECTION_ORDER': IDL.Null,
      'BOOKING_CONFIRMATION': IDL.Null,
      'BILL_OF_LADING': IDL.Null,
      'TRANSPORT_CONTRACT': IDL.Null,
      'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
      'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
      'EXPORT_INVOICE': IDL.Null,
      'ORIGIN_CERTIFICATE_ICO': IDL.Null,
      'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
      'SERVICE_GUIDE': IDL.Null,
      'WEIGHT_CERTIFICATE': IDL.Null,
      'EXPORT_CONFIRMATION': IDL.Null
    }))], ['query']),
    'getProductCategories': IDL.Func([], [IDL.Vec(IDL.Record({
      'id': IDL.Nat,
      'quality': IDL.Nat,
      'name': IDL.Text,
      'description': IDL.Text
    }))], ['query']),
    'getProductCategory': IDL.Func([IDL.Nat], [IDL.Record({
      'id': IDL.Nat,
      'quality': IDL.Nat,
      'name': IDL.Text,
      'description': IDL.Text
    })], ['query']),
    'getRequiredDocuments': IDL.Func([IDL.Variant({
      'ARBITRATION': IDL.Null,
      'PHASE_1': IDL.Null,
      'PHASE_2': IDL.Null,
      'PHASE_3': IDL.Null,
      'PHASE_4': IDL.Null,
      'PHASE_5': IDL.Null,
      'CONFIRMED': IDL.Null
    })], [IDL.Vec(IDL.Variant({
      'PRE_SHIPMENT_SAMPLE': IDL.Null,
      'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'SHIPPING_INSTRUCTIONS': IDL.Null,
      'PHYTOSANITARY_CERTIFICATE': IDL.Null,
      'SHIPPING_NOTE': IDL.Null,
      'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'GENERIC': IDL.Null,
      'CARGO_COLLECTION_ORDER': IDL.Null,
      'BOOKING_CONFIRMATION': IDL.Null,
      'BILL_OF_LADING': IDL.Null,
      'TRANSPORT_CONTRACT': IDL.Null,
      'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
      'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
      'EXPORT_INVOICE': IDL.Null,
      'ORIGIN_CERTIFICATE_ICO': IDL.Null,
      'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
      'SERVICE_GUIDE': IDL.Null,
      'WEIGHT_CERTIFICATE': IDL.Null,
      'EXPORT_CONFIRMATION': IDL.Null
    }))], ['query']),
    'getShipment': IDL.Func([IDL.Nat], [IDL.Record({
      'id': IDL.Nat,
      'sampleApprovalRequired': IDL.Bool,
      'documents': IDL.Vec(IDL.Tuple(IDL.Variant({
        'PRE_SHIPMENT_SAMPLE': IDL.Null,
        'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'SHIPPING_INSTRUCTIONS': IDL.Null,
        'PHYTOSANITARY_CERTIFICATE': IDL.Null,
        'SHIPPING_NOTE': IDL.Null,
        'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'GENERIC': IDL.Null,
        'CARGO_COLLECTION_ORDER': IDL.Null,
        'BOOKING_CONFIRMATION': IDL.Null,
        'BILL_OF_LADING': IDL.Null,
        'TRANSPORT_CONTRACT': IDL.Null,
        'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
        'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
        'EXPORT_INVOICE': IDL.Null,
        'ORIGIN_CERTIFICATE_ICO': IDL.Null,
        'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
        'SERVICE_GUIDE': IDL.Null,
        'WEIGHT_CERTIFICATE': IDL.Null,
        'EXPORT_CONFIRMATION': IDL.Null
      }), IDL.Vec(IDL.Record({
        'id': IDL.Nat,
        'documentType': IDL.Variant({
          'PRE_SHIPMENT_SAMPLE': IDL.Null,
          'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'SHIPPING_INSTRUCTIONS': IDL.Null,
          'PHYTOSANITARY_CERTIFICATE': IDL.Null,
          'SHIPPING_NOTE': IDL.Null,
          'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'GENERIC': IDL.Null,
          'CARGO_COLLECTION_ORDER': IDL.Null,
          'BOOKING_CONFIRMATION': IDL.Null,
          'BILL_OF_LADING': IDL.Null,
          'TRANSPORT_CONTRACT': IDL.Null,
          'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
          'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
          'EXPORT_INVOICE': IDL.Null,
          'ORIGIN_CERTIFICATE_ICO': IDL.Null,
          'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
          'SERVICE_GUIDE': IDL.Null,
          'WEIGHT_CERTIFICATE': IDL.Null,
          'EXPORT_CONFIRMATION': IDL.Null
        }),
        'externalUrl': IDL.Text,
        'evaluationStatus': IDL.Variant({
          'NOT_APPROVED': IDL.Null,
          'NOT_EVALUATED': IDL.Null,
          'APPROVED': IDL.Null
        }),
        'uploadedBy': IDL.Text
      })))),
      'qualityEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'fundsStatus': IDL.Variant({
        'LOCKED': IDL.Null,
        'RELEASED': IDL.Null,
        'NOT_LOCKED': IDL.Null
      }),
      'supplier': IDL.Text,
      'netWeight': IDL.Nat,
      'fixingDate': IDL.Int,
      'detailsSet': IDL.Bool,
      'containersNumber': IDL.Nat,
      'shipmentNumber': IDL.Nat,
      'grossWeight': IDL.Nat,
      'expirationDate': IDL.Int,
      'quantity': IDL.Nat,
      'sampleEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'differentialApplied': IDL.Nat,
      'price': IDL.Nat,
      'targetExchange': IDL.Text,
      'commissioner': IDL.Text,
      'detailsEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'escrowAddress': IDL.Opt(IDL.Text)
    })], ['query']),
    'getShipmentPhase': IDL.Func([IDL.Nat], [IDL.Variant({
      'ARBITRATION': IDL.Null,
      'PHASE_1': IDL.Null,
      'PHASE_2': IDL.Null,
      'PHASE_3': IDL.Null,
      'PHASE_4': IDL.Null,
      'PHASE_5': IDL.Null,
      'CONFIRMED': IDL.Null
    })], ['query']),
    'getShipments': IDL.Func([], [IDL.Vec(IDL.Record({
      'id': IDL.Nat,
      'sampleApprovalRequired': IDL.Bool,
      'documents': IDL.Vec(IDL.Tuple(IDL.Variant({
        'PRE_SHIPMENT_SAMPLE': IDL.Null,
        'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'SHIPPING_INSTRUCTIONS': IDL.Null,
        'PHYTOSANITARY_CERTIFICATE': IDL.Null,
        'SHIPPING_NOTE': IDL.Null,
        'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'GENERIC': IDL.Null,
        'CARGO_COLLECTION_ORDER': IDL.Null,
        'BOOKING_CONFIRMATION': IDL.Null,
        'BILL_OF_LADING': IDL.Null,
        'TRANSPORT_CONTRACT': IDL.Null,
        'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
        'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
        'EXPORT_INVOICE': IDL.Null,
        'ORIGIN_CERTIFICATE_ICO': IDL.Null,
        'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
        'SERVICE_GUIDE': IDL.Null,
        'WEIGHT_CERTIFICATE': IDL.Null,
        'EXPORT_CONFIRMATION': IDL.Null
      }), IDL.Vec(IDL.Record({
        'id': IDL.Nat,
        'documentType': IDL.Variant({
          'PRE_SHIPMENT_SAMPLE': IDL.Null,
          'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'SHIPPING_INSTRUCTIONS': IDL.Null,
          'PHYTOSANITARY_CERTIFICATE': IDL.Null,
          'SHIPPING_NOTE': IDL.Null,
          'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'GENERIC': IDL.Null,
          'CARGO_COLLECTION_ORDER': IDL.Null,
          'BOOKING_CONFIRMATION': IDL.Null,
          'BILL_OF_LADING': IDL.Null,
          'TRANSPORT_CONTRACT': IDL.Null,
          'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
          'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
          'EXPORT_INVOICE': IDL.Null,
          'ORIGIN_CERTIFICATE_ICO': IDL.Null,
          'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
          'SERVICE_GUIDE': IDL.Null,
          'WEIGHT_CERTIFICATE': IDL.Null,
          'EXPORT_CONFIRMATION': IDL.Null
        }),
        'externalUrl': IDL.Text,
        'evaluationStatus': IDL.Variant({
          'NOT_APPROVED': IDL.Null,
          'NOT_EVALUATED': IDL.Null,
          'APPROVED': IDL.Null
        }),
        'uploadedBy': IDL.Text
      })))),
      'qualityEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'fundsStatus': IDL.Variant({
        'LOCKED': IDL.Null,
        'RELEASED': IDL.Null,
        'NOT_LOCKED': IDL.Null
      }),
      'supplier': IDL.Text,
      'netWeight': IDL.Nat,
      'fixingDate': IDL.Int,
      'detailsSet': IDL.Bool,
      'containersNumber': IDL.Nat,
      'shipmentNumber': IDL.Nat,
      'grossWeight': IDL.Nat,
      'expirationDate': IDL.Int,
      'quantity': IDL.Nat,
      'sampleEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'differentialApplied': IDL.Nat,
      'price': IDL.Nat,
      'targetExchange': IDL.Text,
      'commissioner': IDL.Text,
      'detailsEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'escrowAddress': IDL.Opt(IDL.Text)
    }))], ['query']),
    'getUploadableDocuments': IDL.Func([IDL.Variant({
      'ARBITRATION': IDL.Null,
      'PHASE_1': IDL.Null,
      'PHASE_2': IDL.Null,
      'PHASE_3': IDL.Null,
      'PHASE_4': IDL.Null,
      'PHASE_5': IDL.Null,
      'CONFIRMED': IDL.Null
    })], [IDL.Vec(IDL.Variant({
      'PRE_SHIPMENT_SAMPLE': IDL.Null,
      'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'SHIPPING_INSTRUCTIONS': IDL.Null,
      'PHYTOSANITARY_CERTIFICATE': IDL.Null,
      'SHIPPING_NOTE': IDL.Null,
      'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
      'GENERIC': IDL.Null,
      'CARGO_COLLECTION_ORDER': IDL.Null,
      'BOOKING_CONFIRMATION': IDL.Null,
      'BILL_OF_LADING': IDL.Null,
      'TRANSPORT_CONTRACT': IDL.Null,
      'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
      'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
      'EXPORT_INVOICE': IDL.Null,
      'ORIGIN_CERTIFICATE_ICO': IDL.Null,
      'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
      'SERVICE_GUIDE': IDL.Null,
      'WEIGHT_CERTIFICATE': IDL.Null,
      'EXPORT_CONFIRMATION': IDL.Null
    }))], ['query']),
    'lockFunds': IDL.Func([IDL.Nat], [IDL.Record({
      'id': IDL.Nat,
      'sampleApprovalRequired': IDL.Bool,
      'documents': IDL.Vec(IDL.Tuple(IDL.Variant({
        'PRE_SHIPMENT_SAMPLE': IDL.Null,
        'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'SHIPPING_INSTRUCTIONS': IDL.Null,
        'PHYTOSANITARY_CERTIFICATE': IDL.Null,
        'SHIPPING_NOTE': IDL.Null,
        'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'GENERIC': IDL.Null,
        'CARGO_COLLECTION_ORDER': IDL.Null,
        'BOOKING_CONFIRMATION': IDL.Null,
        'BILL_OF_LADING': IDL.Null,
        'TRANSPORT_CONTRACT': IDL.Null,
        'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
        'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
        'EXPORT_INVOICE': IDL.Null,
        'ORIGIN_CERTIFICATE_ICO': IDL.Null,
        'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
        'SERVICE_GUIDE': IDL.Null,
        'WEIGHT_CERTIFICATE': IDL.Null,
        'EXPORT_CONFIRMATION': IDL.Null
      }), IDL.Vec(IDL.Record({
        'id': IDL.Nat,
        'documentType': IDL.Variant({
          'PRE_SHIPMENT_SAMPLE': IDL.Null,
          'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'SHIPPING_INSTRUCTIONS': IDL.Null,
          'PHYTOSANITARY_CERTIFICATE': IDL.Null,
          'SHIPPING_NOTE': IDL.Null,
          'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'GENERIC': IDL.Null,
          'CARGO_COLLECTION_ORDER': IDL.Null,
          'BOOKING_CONFIRMATION': IDL.Null,
          'BILL_OF_LADING': IDL.Null,
          'TRANSPORT_CONTRACT': IDL.Null,
          'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
          'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
          'EXPORT_INVOICE': IDL.Null,
          'ORIGIN_CERTIFICATE_ICO': IDL.Null,
          'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
          'SERVICE_GUIDE': IDL.Null,
          'WEIGHT_CERTIFICATE': IDL.Null,
          'EXPORT_CONFIRMATION': IDL.Null
        }),
        'externalUrl': IDL.Text,
        'evaluationStatus': IDL.Variant({
          'NOT_APPROVED': IDL.Null,
          'NOT_EVALUATED': IDL.Null,
          'APPROVED': IDL.Null
        }),
        'uploadedBy': IDL.Text
      })))),
      'qualityEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'fundsStatus': IDL.Variant({
        'LOCKED': IDL.Null,
        'RELEASED': IDL.Null,
        'NOT_LOCKED': IDL.Null
      }),
      'supplier': IDL.Text,
      'netWeight': IDL.Nat,
      'fixingDate': IDL.Int,
      'detailsSet': IDL.Bool,
      'containersNumber': IDL.Nat,
      'shipmentNumber': IDL.Nat,
      'grossWeight': IDL.Nat,
      'expirationDate': IDL.Int,
      'quantity': IDL.Nat,
      'sampleEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'differentialApplied': IDL.Nat,
      'price': IDL.Nat,
      'targetExchange': IDL.Text,
      'commissioner': IDL.Text,
      'detailsEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'escrowAddress': IDL.Opt(IDL.Text)
    })], []),
    'logout': IDL.Func([], [], []),
    'setShipmentDetails': IDL.Func([IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat], [IDL.Record({
      'id': IDL.Nat,
      'sampleApprovalRequired': IDL.Bool,
      'documents': IDL.Vec(IDL.Tuple(IDL.Variant({
        'PRE_SHIPMENT_SAMPLE': IDL.Null,
        'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'SHIPPING_INSTRUCTIONS': IDL.Null,
        'PHYTOSANITARY_CERTIFICATE': IDL.Null,
        'SHIPPING_NOTE': IDL.Null,
        'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'GENERIC': IDL.Null,
        'CARGO_COLLECTION_ORDER': IDL.Null,
        'BOOKING_CONFIRMATION': IDL.Null,
        'BILL_OF_LADING': IDL.Null,
        'TRANSPORT_CONTRACT': IDL.Null,
        'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
        'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
        'EXPORT_INVOICE': IDL.Null,
        'ORIGIN_CERTIFICATE_ICO': IDL.Null,
        'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
        'SERVICE_GUIDE': IDL.Null,
        'WEIGHT_CERTIFICATE': IDL.Null,
        'EXPORT_CONFIRMATION': IDL.Null
      }), IDL.Vec(IDL.Record({
        'id': IDL.Nat,
        'documentType': IDL.Variant({
          'PRE_SHIPMENT_SAMPLE': IDL.Null,
          'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'SHIPPING_INSTRUCTIONS': IDL.Null,
          'PHYTOSANITARY_CERTIFICATE': IDL.Null,
          'SHIPPING_NOTE': IDL.Null,
          'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'GENERIC': IDL.Null,
          'CARGO_COLLECTION_ORDER': IDL.Null,
          'BOOKING_CONFIRMATION': IDL.Null,
          'BILL_OF_LADING': IDL.Null,
          'TRANSPORT_CONTRACT': IDL.Null,
          'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
          'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
          'EXPORT_INVOICE': IDL.Null,
          'ORIGIN_CERTIFICATE_ICO': IDL.Null,
          'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
          'SERVICE_GUIDE': IDL.Null,
          'WEIGHT_CERTIFICATE': IDL.Null,
          'EXPORT_CONFIRMATION': IDL.Null
        }),
        'externalUrl': IDL.Text,
        'evaluationStatus': IDL.Variant({
          'NOT_APPROVED': IDL.Null,
          'NOT_EVALUATED': IDL.Null,
          'APPROVED': IDL.Null
        }),
        'uploadedBy': IDL.Text
      })))),
      'qualityEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'fundsStatus': IDL.Variant({
        'LOCKED': IDL.Null,
        'RELEASED': IDL.Null,
        'NOT_LOCKED': IDL.Null
      }),
      'supplier': IDL.Text,
      'netWeight': IDL.Nat,
      'fixingDate': IDL.Int,
      'detailsSet': IDL.Bool,
      'containersNumber': IDL.Nat,
      'shipmentNumber': IDL.Nat,
      'grossWeight': IDL.Nat,
      'expirationDate': IDL.Int,
      'quantity': IDL.Nat,
      'sampleEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'differentialApplied': IDL.Nat,
      'price': IDL.Nat,
      'targetExchange': IDL.Text,
      'commissioner': IDL.Text,
      'detailsEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'escrowAddress': IDL.Opt(IDL.Text)
    })], []),
    'signOrder': IDL.Func([IDL.Nat], [IDL.Record({
      'id': IDL.Nat,
      'shipper': IDL.Text,
      'status': IDL.Variant({
        'EXPIRED': IDL.Null,
        'PENDING': IDL.Null,
        'CONFIRMED': IDL.Null
      }),
      'arbiter': IDL.Text,
      'deliveryDeadline': IDL.Nat,
      'token': IDL.Text,
      'customer': IDL.Text,
      'paymentDeadline': IDL.Nat,
      'supplier': IDL.Text,
      'deliveryPort': IDL.Text,
      'lines': IDL.Vec(IDL.Record({
        'productCategory': IDL.Record({
          'id': IDL.Nat,
          'quality': IDL.Nat,
          'name': IDL.Text,
          'description': IDL.Text
        }),
        'unit': IDL.Text,
        'quantity': IDL.Float32,
        'price': IDL.Record({
          'fiat': IDL.Text,
          'amount': IDL.Float32
        })
      })),
      'agreedAmount': IDL.Nat,
      'incoterms': IDL.Text,
      'shippingPort': IDL.Text,
      'signatures': IDL.Vec(IDL.Text),
      'shippingDeadline': IDL.Nat,
      'shipmentId': IDL.Opt(IDL.Nat),
      'commissioner': IDL.Text,
      'documentDeliveryDeadline': IDL.Nat
    })], []),
    'unlockFunds': IDL.Func([IDL.Nat], [IDL.Record({
      'id': IDL.Nat,
      'sampleApprovalRequired': IDL.Bool,
      'documents': IDL.Vec(IDL.Tuple(IDL.Variant({
        'PRE_SHIPMENT_SAMPLE': IDL.Null,
        'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'SHIPPING_INSTRUCTIONS': IDL.Null,
        'PHYTOSANITARY_CERTIFICATE': IDL.Null,
        'SHIPPING_NOTE': IDL.Null,
        'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'GENERIC': IDL.Null,
        'CARGO_COLLECTION_ORDER': IDL.Null,
        'BOOKING_CONFIRMATION': IDL.Null,
        'BILL_OF_LADING': IDL.Null,
        'TRANSPORT_CONTRACT': IDL.Null,
        'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
        'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
        'EXPORT_INVOICE': IDL.Null,
        'ORIGIN_CERTIFICATE_ICO': IDL.Null,
        'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
        'SERVICE_GUIDE': IDL.Null,
        'WEIGHT_CERTIFICATE': IDL.Null,
        'EXPORT_CONFIRMATION': IDL.Null
      }), IDL.Vec(IDL.Record({
        'id': IDL.Nat,
        'documentType': IDL.Variant({
          'PRE_SHIPMENT_SAMPLE': IDL.Null,
          'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'SHIPPING_INSTRUCTIONS': IDL.Null,
          'PHYTOSANITARY_CERTIFICATE': IDL.Null,
          'SHIPPING_NOTE': IDL.Null,
          'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'GENERIC': IDL.Null,
          'CARGO_COLLECTION_ORDER': IDL.Null,
          'BOOKING_CONFIRMATION': IDL.Null,
          'BILL_OF_LADING': IDL.Null,
          'TRANSPORT_CONTRACT': IDL.Null,
          'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
          'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
          'EXPORT_INVOICE': IDL.Null,
          'ORIGIN_CERTIFICATE_ICO': IDL.Null,
          'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
          'SERVICE_GUIDE': IDL.Null,
          'WEIGHT_CERTIFICATE': IDL.Null,
          'EXPORT_CONFIRMATION': IDL.Null
        }),
        'externalUrl': IDL.Text,
        'evaluationStatus': IDL.Variant({
          'NOT_APPROVED': IDL.Null,
          'NOT_EVALUATED': IDL.Null,
          'APPROVED': IDL.Null
        }),
        'uploadedBy': IDL.Text
      })))),
      'qualityEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'fundsStatus': IDL.Variant({
        'LOCKED': IDL.Null,
        'RELEASED': IDL.Null,
        'NOT_LOCKED': IDL.Null
      }),
      'supplier': IDL.Text,
      'netWeight': IDL.Nat,
      'fixingDate': IDL.Int,
      'detailsSet': IDL.Bool,
      'containersNumber': IDL.Nat,
      'shipmentNumber': IDL.Nat,
      'grossWeight': IDL.Nat,
      'expirationDate': IDL.Int,
      'quantity': IDL.Nat,
      'sampleEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'differentialApplied': IDL.Nat,
      'price': IDL.Nat,
      'targetExchange': IDL.Text,
      'commissioner': IDL.Text,
      'detailsEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'escrowAddress': IDL.Opt(IDL.Text)
    })], []),
    'updateDocument': IDL.Func([IDL.Nat, IDL.Nat, IDL.Text], [IDL.Record({
      'id': IDL.Nat,
      'sampleApprovalRequired': IDL.Bool,
      'documents': IDL.Vec(IDL.Tuple(IDL.Variant({
        'PRE_SHIPMENT_SAMPLE': IDL.Null,
        'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'SHIPPING_INSTRUCTIONS': IDL.Null,
        'PHYTOSANITARY_CERTIFICATE': IDL.Null,
        'SHIPPING_NOTE': IDL.Null,
        'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
        'GENERIC': IDL.Null,
        'CARGO_COLLECTION_ORDER': IDL.Null,
        'BOOKING_CONFIRMATION': IDL.Null,
        'BILL_OF_LADING': IDL.Null,
        'TRANSPORT_CONTRACT': IDL.Null,
        'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
        'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
        'EXPORT_INVOICE': IDL.Null,
        'ORIGIN_CERTIFICATE_ICO': IDL.Null,
        'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
        'SERVICE_GUIDE': IDL.Null,
        'WEIGHT_CERTIFICATE': IDL.Null,
        'EXPORT_CONFIRMATION': IDL.Null
      }), IDL.Vec(IDL.Record({
        'id': IDL.Nat,
        'documentType': IDL.Variant({
          'PRE_SHIPMENT_SAMPLE': IDL.Null,
          'FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'SHIPPING_INSTRUCTIONS': IDL.Null,
          'PHYTOSANITARY_CERTIFICATE': IDL.Null,
          'SHIPPING_NOTE': IDL.Null,
          'TO_BE_FREED_SINGLE_EXPORT_DECLARATION': IDL.Null,
          'GENERIC': IDL.Null,
          'CARGO_COLLECTION_ORDER': IDL.Null,
          'BOOKING_CONFIRMATION': IDL.Null,
          'BILL_OF_LADING': IDL.Null,
          'TRANSPORT_CONTRACT': IDL.Null,
          'CONTAINER_PROOF_OF_DELIVERY': IDL.Null,
          'SENSORY_EVALUATION_ANALYSIS_REPORT': IDL.Null,
          'EXPORT_INVOICE': IDL.Null,
          'ORIGIN_CERTIFICATE_ICO': IDL.Null,
          'SUBJECT_TO_APPROVAL_OF_SAMPLE': IDL.Null,
          'SERVICE_GUIDE': IDL.Null,
          'WEIGHT_CERTIFICATE': IDL.Null,
          'EXPORT_CONFIRMATION': IDL.Null
        }),
        'externalUrl': IDL.Text,
        'evaluationStatus': IDL.Variant({
          'NOT_APPROVED': IDL.Null,
          'NOT_EVALUATED': IDL.Null,
          'APPROVED': IDL.Null
        }),
        'uploadedBy': IDL.Text
      })))),
      'qualityEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'fundsStatus': IDL.Variant({
        'LOCKED': IDL.Null,
        'RELEASED': IDL.Null,
        'NOT_LOCKED': IDL.Null
      }),
      'supplier': IDL.Text,
      'netWeight': IDL.Nat,
      'fixingDate': IDL.Int,
      'detailsSet': IDL.Bool,
      'containersNumber': IDL.Nat,
      'shipmentNumber': IDL.Nat,
      'grossWeight': IDL.Nat,
      'expirationDate': IDL.Int,
      'quantity': IDL.Nat,
      'sampleEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'differentialApplied': IDL.Nat,
      'price': IDL.Nat,
      'targetExchange': IDL.Text,
      'commissioner': IDL.Text,
      'detailsEvaluationStatus': IDL.Variant({
        'NOT_APPROVED': IDL.Null,
        'NOT_EVALUATED': IDL.Null,
        'APPROVED': IDL.Null
      }),
      'escrowAddress': IDL.Opt(IDL.Text)
    })], []),
    'updateMaterial': IDL.Func([IDL.Nat, IDL.Nat], [IDL.Record({
      'id': IDL.Nat,
      'productCategory': IDL.Record({
        'id': IDL.Nat,
        'quality': IDL.Nat,
        'name': IDL.Text,
        'description': IDL.Text
      })
    })], []),
    'updateOrder': IDL.Func([IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Vec(IDL.Record({
      'productCategoryId': IDL.Nat,
      'unit': IDL.Text,
      'quantity': IDL.Float32,
      'price': IDL.Record({
        'fiat': IDL.Text,
        'amount': IDL.Float32
      })
    }))], [IDL.Record({
      'id': IDL.Nat,
      'shipper': IDL.Text,
      'status': IDL.Variant({
        'EXPIRED': IDL.Null,
        'PENDING': IDL.Null,
        'CONFIRMED': IDL.Null
      }),
      'arbiter': IDL.Text,
      'deliveryDeadline': IDL.Nat,
      'token': IDL.Text,
      'customer': IDL.Text,
      'paymentDeadline': IDL.Nat,
      'supplier': IDL.Text,
      'deliveryPort': IDL.Text,
      'lines': IDL.Vec(IDL.Record({
        'productCategory': IDL.Record({
          'id': IDL.Nat,
          'quality': IDL.Nat,
          'name': IDL.Text,
          'description': IDL.Text
        }),
        'unit': IDL.Text,
        'quantity': IDL.Float32,
        'price': IDL.Record({
          'fiat': IDL.Text,
          'amount': IDL.Float32
        })
      })),
      'agreedAmount': IDL.Nat,
      'incoterms': IDL.Text,
      'shippingPort': IDL.Text,
      'signatures': IDL.Vec(IDL.Text),
      'shippingDeadline': IDL.Nat,
      'shipmentId': IDL.Opt(IDL.Nat),
      'commissioner': IDL.Text,
      'documentDeliveryDeadline': IDL.Nat
    })], []),
    'updateOrganization': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Variant({
      'EXPORTER': IDL.Null,
      'IMPORTER': IDL.Null,
      'ARBITER': IDL.Null
    }), IDL.Text, IDL.Text, IDL.Text], [IDL.Record({
      'region': IDL.Opt(IDL.Text),
      'ethAddress': IDL.Text,
      'city': IDL.Opt(IDL.Text),
      'postalCode': IDL.Opt(IDL.Text),
      'role': IDL.Opt(IDL.Variant({
        'EXPORTER': IDL.Null,
        'IMPORTER': IDL.Null,
        'ARBITER': IDL.Null
      })),
      'email': IDL.Opt(IDL.Text),
      'legalName': IDL.Text,
      'countryCode': IDL.Opt(IDL.Text),
      'industrialSector': IDL.Opt(IDL.Text),
      'address': IDL.Opt(IDL.Text),
      'visibilityLevel': IDL.Variant({
        'BROAD': IDL.Null,
        'NARROW': IDL.Null
      }),
      'image': IDL.Opt(IDL.Text),
      'telephone': IDL.Opt(IDL.Text)
    })], []),
    'updateProductCategory': IDL.Func([IDL.Nat, IDL.Text, IDL.Nat, IDL.Text], [IDL.Record({
      'id': IDL.Nat,
      'quality': IDL.Nat,
      'name': IDL.Text,
      'description': IDL.Text
    })], [])
  });
};
exports.idlFactory = idlFactory;
const init = ({
  IDL
}) => {
  return [];
};
exports.init = init;
