import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'addDocument' : ActorMethod<
    [
      bigint,
      { 'PRE_SHIPMENT_SAMPLE' : null } |
        { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'SHIPPING_INSTRUCTIONS' : null } |
        { 'PHYTOSANITARY_CERTIFICATE' : null } |
        { 'SHIPPING_NOTE' : null } |
        { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'GENERIC' : null } |
        { 'CARGO_COLLECTION_ORDER' : null } |
        { 'BOOKING_CONFIRMATION' : null } |
        { 'BILL_OF_LADING' : null } |
        { 'TRANSPORT_CONTRACT' : null } |
        { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
        { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
        { 'EXPORT_INVOICE' : null } |
        { 'ORIGIN_CERTIFICATE_ICO' : null } |
        { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
        { 'SERVICE_GUIDE' : null } |
        { 'WEIGHT_CERTIFICATE' : null } |
        { 'EXPORT_CONFIRMATION' : null },
      string,
    ],
    {
      'id' : bigint,
      'sampleApprovalRequired' : boolean,
      'documents' : Array<
        [
          { 'PRE_SHIPMENT_SAMPLE' : null } |
            { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'SHIPPING_INSTRUCTIONS' : null } |
            { 'PHYTOSANITARY_CERTIFICATE' : null } |
            { 'SHIPPING_NOTE' : null } |
            { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'GENERIC' : null } |
            { 'CARGO_COLLECTION_ORDER' : null } |
            { 'BOOKING_CONFIRMATION' : null } |
            { 'BILL_OF_LADING' : null } |
            { 'TRANSPORT_CONTRACT' : null } |
            { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
            { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
            { 'EXPORT_INVOICE' : null } |
            { 'ORIGIN_CERTIFICATE_ICO' : null } |
            { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
            { 'SERVICE_GUIDE' : null } |
            { 'WEIGHT_CERTIFICATE' : null } |
            { 'EXPORT_CONFIRMATION' : null },
          Array<
            {
              'id' : bigint,
              'documentType' : { 'PRE_SHIPMENT_SAMPLE' : null } |
                { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'SHIPPING_INSTRUCTIONS' : null } |
                { 'PHYTOSANITARY_CERTIFICATE' : null } |
                { 'SHIPPING_NOTE' : null } |
                { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'GENERIC' : null } |
                { 'CARGO_COLLECTION_ORDER' : null } |
                { 'BOOKING_CONFIRMATION' : null } |
                { 'BILL_OF_LADING' : null } |
                { 'TRANSPORT_CONTRACT' : null } |
                { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
                { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
                { 'EXPORT_INVOICE' : null } |
                { 'ORIGIN_CERTIFICATE_ICO' : null } |
                { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
                { 'SERVICE_GUIDE' : null } |
                { 'WEIGHT_CERTIFICATE' : null } |
                { 'EXPORT_CONFIRMATION' : null },
              'externalUrl' : string,
              'evaluationStatus' : { 'NOT_APPROVED' : null } |
                { 'NOT_EVALUATED' : null } |
                { 'APPROVED' : null },
              'uploadedBy' : string,
            }
          >,
        ]
      >,
      'qualityEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'fundsStatus' : { 'LOCKED' : null } |
        { 'RELEASED' : null } |
        { 'NOT_LOCKED' : null },
      'supplier' : string,
      'netWeight' : bigint,
      'fixingDate' : bigint,
      'detailsSet' : boolean,
      'containersNumber' : bigint,
      'shipmentNumber' : bigint,
      'grossWeight' : bigint,
      'expirationDate' : bigint,
      'quantity' : bigint,
      'sampleEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'differentialApplied' : bigint,
      'price' : bigint,
      'targetExchange' : string,
      'commissioner' : string,
      'detailsEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'escrowAddress' : [] | [string],
    }
  >,
  'authenticate' : ActorMethod<
    [
      {
        'delegateCredentialIdHash' : string,
        'delegateCredentialExpiryDate' : bigint,
        'role' : string,
        'signer' : string,
        'membershipProof' : {
          'issuer' : string,
          'delegatorCredentialIdHash' : string,
          'delegatorCredentialExpiryDate' : bigint,
          'signedProof' : string,
          'delegatorAddress' : string,
        },
        'signedProof' : string,
      },
    ],
    undefined
  >,
  'createMaterial' : ActorMethod<
    [bigint],
    {
      'id' : bigint,
      'productCategory' : {
        'id' : bigint,
        'quality' : bigint,
        'name' : string,
        'description' : string,
      },
    }
  >,
  'createOffer' : ActorMethod<
    [bigint],
    {
      'id' : bigint,
      'productCategory' : {
        'id' : bigint,
        'quality' : bigint,
        'name' : string,
        'description' : string,
      },
      'owner' : string,
    }
  >,
  'createOrder' : ActorMethod<
    [
      string,
      string,
      string,
      bigint,
      bigint,
      bigint,
      bigint,
      string,
      string,
      bigint,
      string,
      string,
      string,
      string,
      Array<
        {
          'productCategoryId' : bigint,
          'unit' : string,
          'quantity' : number,
          'price' : { 'fiat' : string, 'amount' : number },
        }
      >,
    ],
    {
      'id' : bigint,
      'shipper' : string,
      'status' : { 'EXPIRED' : null } |
        { 'PENDING' : null } |
        { 'CONFIRMED' : null },
      'arbiter' : string,
      'deliveryDeadline' : bigint,
      'token' : string,
      'customer' : string,
      'paymentDeadline' : bigint,
      'supplier' : string,
      'deliveryPort' : string,
      'lines' : Array<
        {
          'productCategory' : {
            'id' : bigint,
            'quality' : bigint,
            'name' : string,
            'description' : string,
          },
          'unit' : string,
          'quantity' : number,
          'price' : { 'fiat' : string, 'amount' : number },
        }
      >,
      'agreedAmount' : bigint,
      'incoterms' : string,
      'shippingPort' : string,
      'signatures' : Array<string>,
      'shippingDeadline' : bigint,
      'shipmentId' : [] | [bigint],
      'commissioner' : string,
      'documentDeliveryDeadline' : bigint,
    }
  >,
  'createOrganization' : ActorMethod<
    [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      { 'EXPORTER' : null } |
        { 'IMPORTER' : null } |
        { 'ARBITER' : null },
      string,
      string,
      string,
    ],
    {
      'region' : [] | [string],
      'ethAddress' : string,
      'city' : [] | [string],
      'postalCode' : [] | [string],
      'role' : [] | [
        { 'EXPORTER' : null } |
          { 'IMPORTER' : null } |
          { 'ARBITER' : null }
      ],
      'email' : [] | [string],
      'legalName' : string,
      'countryCode' : [] | [string],
      'industrialSector' : [] | [string],
      'address' : [] | [string],
      'visibilityLevel' : { 'BROAD' : null } |
        { 'NARROW' : null },
      'image' : [] | [string],
      'telephone' : [] | [string],
    }
  >,
  'createProductCategory' : ActorMethod<
    [string, bigint, string],
    {
      'id' : bigint,
      'quality' : bigint,
      'name' : string,
      'description' : string,
    }
  >,
  'deleteOrder' : ActorMethod<[bigint], boolean>,
  'deleteOrganization' : ActorMethod<[string], boolean>,
  'deleteProductCategory' : ActorMethod<[bigint], boolean>,
  'depositFunds' : ActorMethod<
    [bigint, bigint],
    {
      'id' : bigint,
      'sampleApprovalRequired' : boolean,
      'documents' : Array<
        [
          { 'PRE_SHIPMENT_SAMPLE' : null } |
            { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'SHIPPING_INSTRUCTIONS' : null } |
            { 'PHYTOSANITARY_CERTIFICATE' : null } |
            { 'SHIPPING_NOTE' : null } |
            { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'GENERIC' : null } |
            { 'CARGO_COLLECTION_ORDER' : null } |
            { 'BOOKING_CONFIRMATION' : null } |
            { 'BILL_OF_LADING' : null } |
            { 'TRANSPORT_CONTRACT' : null } |
            { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
            { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
            { 'EXPORT_INVOICE' : null } |
            { 'ORIGIN_CERTIFICATE_ICO' : null } |
            { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
            { 'SERVICE_GUIDE' : null } |
            { 'WEIGHT_CERTIFICATE' : null } |
            { 'EXPORT_CONFIRMATION' : null },
          Array<
            {
              'id' : bigint,
              'documentType' : { 'PRE_SHIPMENT_SAMPLE' : null } |
                { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'SHIPPING_INSTRUCTIONS' : null } |
                { 'PHYTOSANITARY_CERTIFICATE' : null } |
                { 'SHIPPING_NOTE' : null } |
                { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'GENERIC' : null } |
                { 'CARGO_COLLECTION_ORDER' : null } |
                { 'BOOKING_CONFIRMATION' : null } |
                { 'BILL_OF_LADING' : null } |
                { 'TRANSPORT_CONTRACT' : null } |
                { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
                { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
                { 'EXPORT_INVOICE' : null } |
                { 'ORIGIN_CERTIFICATE_ICO' : null } |
                { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
                { 'SERVICE_GUIDE' : null } |
                { 'WEIGHT_CERTIFICATE' : null } |
                { 'EXPORT_CONFIRMATION' : null },
              'externalUrl' : string,
              'evaluationStatus' : { 'NOT_APPROVED' : null } |
                { 'NOT_EVALUATED' : null } |
                { 'APPROVED' : null },
              'uploadedBy' : string,
            }
          >,
        ]
      >,
      'qualityEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'fundsStatus' : { 'LOCKED' : null } |
        { 'RELEASED' : null } |
        { 'NOT_LOCKED' : null },
      'supplier' : string,
      'netWeight' : bigint,
      'fixingDate' : bigint,
      'detailsSet' : boolean,
      'containersNumber' : bigint,
      'shipmentNumber' : bigint,
      'grossWeight' : bigint,
      'expirationDate' : bigint,
      'quantity' : bigint,
      'sampleEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'differentialApplied' : bigint,
      'price' : bigint,
      'targetExchange' : string,
      'commissioner' : string,
      'detailsEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'escrowAddress' : [] | [string],
    }
  >,
  'determineEscrowAddress' : ActorMethod<
    [bigint],
    {
      'id' : bigint,
      'sampleApprovalRequired' : boolean,
      'documents' : Array<
        [
          { 'PRE_SHIPMENT_SAMPLE' : null } |
            { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'SHIPPING_INSTRUCTIONS' : null } |
            { 'PHYTOSANITARY_CERTIFICATE' : null } |
            { 'SHIPPING_NOTE' : null } |
            { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'GENERIC' : null } |
            { 'CARGO_COLLECTION_ORDER' : null } |
            { 'BOOKING_CONFIRMATION' : null } |
            { 'BILL_OF_LADING' : null } |
            { 'TRANSPORT_CONTRACT' : null } |
            { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
            { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
            { 'EXPORT_INVOICE' : null } |
            { 'ORIGIN_CERTIFICATE_ICO' : null } |
            { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
            { 'SERVICE_GUIDE' : null } |
            { 'WEIGHT_CERTIFICATE' : null } |
            { 'EXPORT_CONFIRMATION' : null },
          Array<
            {
              'id' : bigint,
              'documentType' : { 'PRE_SHIPMENT_SAMPLE' : null } |
                { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'SHIPPING_INSTRUCTIONS' : null } |
                { 'PHYTOSANITARY_CERTIFICATE' : null } |
                { 'SHIPPING_NOTE' : null } |
                { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'GENERIC' : null } |
                { 'CARGO_COLLECTION_ORDER' : null } |
                { 'BOOKING_CONFIRMATION' : null } |
                { 'BILL_OF_LADING' : null } |
                { 'TRANSPORT_CONTRACT' : null } |
                { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
                { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
                { 'EXPORT_INVOICE' : null } |
                { 'ORIGIN_CERTIFICATE_ICO' : null } |
                { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
                { 'SERVICE_GUIDE' : null } |
                { 'WEIGHT_CERTIFICATE' : null } |
                { 'EXPORT_CONFIRMATION' : null },
              'externalUrl' : string,
              'evaluationStatus' : { 'NOT_APPROVED' : null } |
                { 'NOT_EVALUATED' : null } |
                { 'APPROVED' : null },
              'uploadedBy' : string,
            }
          >,
        ]
      >,
      'qualityEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'fundsStatus' : { 'LOCKED' : null } |
        { 'RELEASED' : null } |
        { 'NOT_LOCKED' : null },
      'supplier' : string,
      'netWeight' : bigint,
      'fixingDate' : bigint,
      'detailsSet' : boolean,
      'containersNumber' : bigint,
      'shipmentNumber' : bigint,
      'grossWeight' : bigint,
      'expirationDate' : bigint,
      'quantity' : bigint,
      'sampleEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'differentialApplied' : bigint,
      'price' : bigint,
      'targetExchange' : string,
      'commissioner' : string,
      'detailsEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'escrowAddress' : [] | [string],
    }
  >,
  'evaluateDocument' : ActorMethod<
    [
      bigint,
      bigint,
      { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
    ],
    {
      'id' : bigint,
      'sampleApprovalRequired' : boolean,
      'documents' : Array<
        [
          { 'PRE_SHIPMENT_SAMPLE' : null } |
            { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'SHIPPING_INSTRUCTIONS' : null } |
            { 'PHYTOSANITARY_CERTIFICATE' : null } |
            { 'SHIPPING_NOTE' : null } |
            { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'GENERIC' : null } |
            { 'CARGO_COLLECTION_ORDER' : null } |
            { 'BOOKING_CONFIRMATION' : null } |
            { 'BILL_OF_LADING' : null } |
            { 'TRANSPORT_CONTRACT' : null } |
            { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
            { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
            { 'EXPORT_INVOICE' : null } |
            { 'ORIGIN_CERTIFICATE_ICO' : null } |
            { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
            { 'SERVICE_GUIDE' : null } |
            { 'WEIGHT_CERTIFICATE' : null } |
            { 'EXPORT_CONFIRMATION' : null },
          Array<
            {
              'id' : bigint,
              'documentType' : { 'PRE_SHIPMENT_SAMPLE' : null } |
                { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'SHIPPING_INSTRUCTIONS' : null } |
                { 'PHYTOSANITARY_CERTIFICATE' : null } |
                { 'SHIPPING_NOTE' : null } |
                { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'GENERIC' : null } |
                { 'CARGO_COLLECTION_ORDER' : null } |
                { 'BOOKING_CONFIRMATION' : null } |
                { 'BILL_OF_LADING' : null } |
                { 'TRANSPORT_CONTRACT' : null } |
                { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
                { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
                { 'EXPORT_INVOICE' : null } |
                { 'ORIGIN_CERTIFICATE_ICO' : null } |
                { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
                { 'SERVICE_GUIDE' : null } |
                { 'WEIGHT_CERTIFICATE' : null } |
                { 'EXPORT_CONFIRMATION' : null },
              'externalUrl' : string,
              'evaluationStatus' : { 'NOT_APPROVED' : null } |
                { 'NOT_EVALUATED' : null } |
                { 'APPROVED' : null },
              'uploadedBy' : string,
            }
          >,
        ]
      >,
      'qualityEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'fundsStatus' : { 'LOCKED' : null } |
        { 'RELEASED' : null } |
        { 'NOT_LOCKED' : null },
      'supplier' : string,
      'netWeight' : bigint,
      'fixingDate' : bigint,
      'detailsSet' : boolean,
      'containersNumber' : bigint,
      'shipmentNumber' : bigint,
      'grossWeight' : bigint,
      'expirationDate' : bigint,
      'quantity' : bigint,
      'sampleEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'differentialApplied' : bigint,
      'price' : bigint,
      'targetExchange' : string,
      'commissioner' : string,
      'detailsEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'escrowAddress' : [] | [string],
    }
  >,
  'evaluateQuality' : ActorMethod<
    [
      bigint,
      { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
    ],
    {
      'id' : bigint,
      'sampleApprovalRequired' : boolean,
      'documents' : Array<
        [
          { 'PRE_SHIPMENT_SAMPLE' : null } |
            { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'SHIPPING_INSTRUCTIONS' : null } |
            { 'PHYTOSANITARY_CERTIFICATE' : null } |
            { 'SHIPPING_NOTE' : null } |
            { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'GENERIC' : null } |
            { 'CARGO_COLLECTION_ORDER' : null } |
            { 'BOOKING_CONFIRMATION' : null } |
            { 'BILL_OF_LADING' : null } |
            { 'TRANSPORT_CONTRACT' : null } |
            { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
            { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
            { 'EXPORT_INVOICE' : null } |
            { 'ORIGIN_CERTIFICATE_ICO' : null } |
            { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
            { 'SERVICE_GUIDE' : null } |
            { 'WEIGHT_CERTIFICATE' : null } |
            { 'EXPORT_CONFIRMATION' : null },
          Array<
            {
              'id' : bigint,
              'documentType' : { 'PRE_SHIPMENT_SAMPLE' : null } |
                { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'SHIPPING_INSTRUCTIONS' : null } |
                { 'PHYTOSANITARY_CERTIFICATE' : null } |
                { 'SHIPPING_NOTE' : null } |
                { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'GENERIC' : null } |
                { 'CARGO_COLLECTION_ORDER' : null } |
                { 'BOOKING_CONFIRMATION' : null } |
                { 'BILL_OF_LADING' : null } |
                { 'TRANSPORT_CONTRACT' : null } |
                { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
                { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
                { 'EXPORT_INVOICE' : null } |
                { 'ORIGIN_CERTIFICATE_ICO' : null } |
                { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
                { 'SERVICE_GUIDE' : null } |
                { 'WEIGHT_CERTIFICATE' : null } |
                { 'EXPORT_CONFIRMATION' : null },
              'externalUrl' : string,
              'evaluationStatus' : { 'NOT_APPROVED' : null } |
                { 'NOT_EVALUATED' : null } |
                { 'APPROVED' : null },
              'uploadedBy' : string,
            }
          >,
        ]
      >,
      'qualityEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'fundsStatus' : { 'LOCKED' : null } |
        { 'RELEASED' : null } |
        { 'NOT_LOCKED' : null },
      'supplier' : string,
      'netWeight' : bigint,
      'fixingDate' : bigint,
      'detailsSet' : boolean,
      'containersNumber' : bigint,
      'shipmentNumber' : bigint,
      'grossWeight' : bigint,
      'expirationDate' : bigint,
      'quantity' : bigint,
      'sampleEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'differentialApplied' : bigint,
      'price' : bigint,
      'targetExchange' : string,
      'commissioner' : string,
      'detailsEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'escrowAddress' : [] | [string],
    }
  >,
  'evaluateSample' : ActorMethod<
    [
      bigint,
      { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
    ],
    {
      'id' : bigint,
      'sampleApprovalRequired' : boolean,
      'documents' : Array<
        [
          { 'PRE_SHIPMENT_SAMPLE' : null } |
            { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'SHIPPING_INSTRUCTIONS' : null } |
            { 'PHYTOSANITARY_CERTIFICATE' : null } |
            { 'SHIPPING_NOTE' : null } |
            { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'GENERIC' : null } |
            { 'CARGO_COLLECTION_ORDER' : null } |
            { 'BOOKING_CONFIRMATION' : null } |
            { 'BILL_OF_LADING' : null } |
            { 'TRANSPORT_CONTRACT' : null } |
            { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
            { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
            { 'EXPORT_INVOICE' : null } |
            { 'ORIGIN_CERTIFICATE_ICO' : null } |
            { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
            { 'SERVICE_GUIDE' : null } |
            { 'WEIGHT_CERTIFICATE' : null } |
            { 'EXPORT_CONFIRMATION' : null },
          Array<
            {
              'id' : bigint,
              'documentType' : { 'PRE_SHIPMENT_SAMPLE' : null } |
                { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'SHIPPING_INSTRUCTIONS' : null } |
                { 'PHYTOSANITARY_CERTIFICATE' : null } |
                { 'SHIPPING_NOTE' : null } |
                { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'GENERIC' : null } |
                { 'CARGO_COLLECTION_ORDER' : null } |
                { 'BOOKING_CONFIRMATION' : null } |
                { 'BILL_OF_LADING' : null } |
                { 'TRANSPORT_CONTRACT' : null } |
                { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
                { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
                { 'EXPORT_INVOICE' : null } |
                { 'ORIGIN_CERTIFICATE_ICO' : null } |
                { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
                { 'SERVICE_GUIDE' : null } |
                { 'WEIGHT_CERTIFICATE' : null } |
                { 'EXPORT_CONFIRMATION' : null },
              'externalUrl' : string,
              'evaluationStatus' : { 'NOT_APPROVED' : null } |
                { 'NOT_EVALUATED' : null } |
                { 'APPROVED' : null },
              'uploadedBy' : string,
            }
          >,
        ]
      >,
      'qualityEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'fundsStatus' : { 'LOCKED' : null } |
        { 'RELEASED' : null } |
        { 'NOT_LOCKED' : null },
      'supplier' : string,
      'netWeight' : bigint,
      'fixingDate' : bigint,
      'detailsSet' : boolean,
      'containersNumber' : bigint,
      'shipmentNumber' : bigint,
      'grossWeight' : bigint,
      'expirationDate' : bigint,
      'quantity' : bigint,
      'sampleEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'differentialApplied' : bigint,
      'price' : bigint,
      'targetExchange' : string,
      'commissioner' : string,
      'detailsEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'escrowAddress' : [] | [string],
    }
  >,
  'evaluateShipmentDetails' : ActorMethod<
    [
      bigint,
      { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
    ],
    {
      'id' : bigint,
      'sampleApprovalRequired' : boolean,
      'documents' : Array<
        [
          { 'PRE_SHIPMENT_SAMPLE' : null } |
            { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'SHIPPING_INSTRUCTIONS' : null } |
            { 'PHYTOSANITARY_CERTIFICATE' : null } |
            { 'SHIPPING_NOTE' : null } |
            { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'GENERIC' : null } |
            { 'CARGO_COLLECTION_ORDER' : null } |
            { 'BOOKING_CONFIRMATION' : null } |
            { 'BILL_OF_LADING' : null } |
            { 'TRANSPORT_CONTRACT' : null } |
            { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
            { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
            { 'EXPORT_INVOICE' : null } |
            { 'ORIGIN_CERTIFICATE_ICO' : null } |
            { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
            { 'SERVICE_GUIDE' : null } |
            { 'WEIGHT_CERTIFICATE' : null } |
            { 'EXPORT_CONFIRMATION' : null },
          Array<
            {
              'id' : bigint,
              'documentType' : { 'PRE_SHIPMENT_SAMPLE' : null } |
                { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'SHIPPING_INSTRUCTIONS' : null } |
                { 'PHYTOSANITARY_CERTIFICATE' : null } |
                { 'SHIPPING_NOTE' : null } |
                { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'GENERIC' : null } |
                { 'CARGO_COLLECTION_ORDER' : null } |
                { 'BOOKING_CONFIRMATION' : null } |
                { 'BILL_OF_LADING' : null } |
                { 'TRANSPORT_CONTRACT' : null } |
                { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
                { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
                { 'EXPORT_INVOICE' : null } |
                { 'ORIGIN_CERTIFICATE_ICO' : null } |
                { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
                { 'SERVICE_GUIDE' : null } |
                { 'WEIGHT_CERTIFICATE' : null } |
                { 'EXPORT_CONFIRMATION' : null },
              'externalUrl' : string,
              'evaluationStatus' : { 'NOT_APPROVED' : null } |
                { 'NOT_EVALUATED' : null } |
                { 'APPROVED' : null },
              'uploadedBy' : string,
            }
          >,
        ]
      >,
      'qualityEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'fundsStatus' : { 'LOCKED' : null } |
        { 'RELEASED' : null } |
        { 'NOT_LOCKED' : null },
      'supplier' : string,
      'netWeight' : bigint,
      'fixingDate' : bigint,
      'detailsSet' : boolean,
      'containersNumber' : bigint,
      'shipmentNumber' : bigint,
      'grossWeight' : bigint,
      'expirationDate' : bigint,
      'quantity' : bigint,
      'sampleEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'differentialApplied' : bigint,
      'price' : bigint,
      'targetExchange' : string,
      'commissioner' : string,
      'detailsEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'escrowAddress' : [] | [string],
    }
  >,
  'getCanisterAddress' : ActorMethod<[], string>,
  'getDocument' : ActorMethod<
    [bigint, bigint],
    {
      'id' : bigint,
      'documentType' : { 'PRE_SHIPMENT_SAMPLE' : null } |
        { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'SHIPPING_INSTRUCTIONS' : null } |
        { 'PHYTOSANITARY_CERTIFICATE' : null } |
        { 'SHIPPING_NOTE' : null } |
        { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'GENERIC' : null } |
        { 'CARGO_COLLECTION_ORDER' : null } |
        { 'BOOKING_CONFIRMATION' : null } |
        { 'BILL_OF_LADING' : null } |
        { 'TRANSPORT_CONTRACT' : null } |
        { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
        { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
        { 'EXPORT_INVOICE' : null } |
        { 'ORIGIN_CERTIFICATE_ICO' : null } |
        { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
        { 'SERVICE_GUIDE' : null } |
        { 'WEIGHT_CERTIFICATE' : null } |
        { 'EXPORT_CONFIRMATION' : null },
      'externalUrl' : string,
      'evaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'uploadedBy' : string,
    }
  >,
  'getDocuments' : ActorMethod<
    [bigint],
    Array<
      [
        { 'PRE_SHIPMENT_SAMPLE' : null } |
          { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
          { 'SHIPPING_INSTRUCTIONS' : null } |
          { 'PHYTOSANITARY_CERTIFICATE' : null } |
          { 'SHIPPING_NOTE' : null } |
          { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
          { 'GENERIC' : null } |
          { 'CARGO_COLLECTION_ORDER' : null } |
          { 'BOOKING_CONFIRMATION' : null } |
          { 'BILL_OF_LADING' : null } |
          { 'TRANSPORT_CONTRACT' : null } |
          { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
          { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
          { 'EXPORT_INVOICE' : null } |
          { 'ORIGIN_CERTIFICATE_ICO' : null } |
          { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
          { 'SERVICE_GUIDE' : null } |
          { 'WEIGHT_CERTIFICATE' : null } |
          { 'EXPORT_CONFIRMATION' : null },
        Array<
          {
            'id' : bigint,
            'documentType' : { 'PRE_SHIPMENT_SAMPLE' : null } |
              { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
              { 'SHIPPING_INSTRUCTIONS' : null } |
              { 'PHYTOSANITARY_CERTIFICATE' : null } |
              { 'SHIPPING_NOTE' : null } |
              { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
              { 'GENERIC' : null } |
              { 'CARGO_COLLECTION_ORDER' : null } |
              { 'BOOKING_CONFIRMATION' : null } |
              { 'BILL_OF_LADING' : null } |
              { 'TRANSPORT_CONTRACT' : null } |
              { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
              { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
              { 'EXPORT_INVOICE' : null } |
              { 'ORIGIN_CERTIFICATE_ICO' : null } |
              { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
              { 'SERVICE_GUIDE' : null } |
              { 'WEIGHT_CERTIFICATE' : null } |
              { 'EXPORT_CONFIRMATION' : null },
            'externalUrl' : string,
            'evaluationStatus' : { 'NOT_APPROVED' : null } |
              { 'NOT_EVALUATED' : null } |
              { 'APPROVED' : null },
            'uploadedBy' : string,
          }
        >,
      ]
    >
  >,
  'getDocumentsByType' : ActorMethod<
    [
      bigint,
      { 'PRE_SHIPMENT_SAMPLE' : null } |
        { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'SHIPPING_INSTRUCTIONS' : null } |
        { 'PHYTOSANITARY_CERTIFICATE' : null } |
        { 'SHIPPING_NOTE' : null } |
        { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'GENERIC' : null } |
        { 'CARGO_COLLECTION_ORDER' : null } |
        { 'BOOKING_CONFIRMATION' : null } |
        { 'BILL_OF_LADING' : null } |
        { 'TRANSPORT_CONTRACT' : null } |
        { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
        { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
        { 'EXPORT_INVOICE' : null } |
        { 'ORIGIN_CERTIFICATE_ICO' : null } |
        { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
        { 'SERVICE_GUIDE' : null } |
        { 'WEIGHT_CERTIFICATE' : null } |
        { 'EXPORT_CONFIRMATION' : null },
    ],
    Array<
      {
        'id' : bigint,
        'documentType' : { 'PRE_SHIPMENT_SAMPLE' : null } |
          { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
          { 'SHIPPING_INSTRUCTIONS' : null } |
          { 'PHYTOSANITARY_CERTIFICATE' : null } |
          { 'SHIPPING_NOTE' : null } |
          { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
          { 'GENERIC' : null } |
          { 'CARGO_COLLECTION_ORDER' : null } |
          { 'BOOKING_CONFIRMATION' : null } |
          { 'BILL_OF_LADING' : null } |
          { 'TRANSPORT_CONTRACT' : null } |
          { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
          { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
          { 'EXPORT_INVOICE' : null } |
          { 'ORIGIN_CERTIFICATE_ICO' : null } |
          { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
          { 'SERVICE_GUIDE' : null } |
          { 'WEIGHT_CERTIFICATE' : null } |
          { 'EXPORT_CONFIRMATION' : null },
        'externalUrl' : string,
        'evaluationStatus' : { 'NOT_APPROVED' : null } |
          { 'NOT_EVALUATED' : null } |
          { 'APPROVED' : null },
        'uploadedBy' : string,
      }
    >
  >,
  'getMaterial' : ActorMethod<
    [bigint],
    {
      'id' : bigint,
      'productCategory' : {
        'id' : bigint,
        'quality' : bigint,
        'name' : string,
        'description' : string,
      },
    }
  >,
  'getMaterials' : ActorMethod<
    [],
    Array<
      {
        'id' : bigint,
        'productCategory' : {
          'id' : bigint,
          'quality' : bigint,
          'name' : string,
          'description' : string,
        },
      }
    >
  >,
  'getOffer' : ActorMethod<
    [bigint],
    {
      'id' : bigint,
      'productCategory' : {
        'id' : bigint,
        'quality' : bigint,
        'name' : string,
        'description' : string,
      },
      'owner' : string,
    }
  >,
  'getOffers' : ActorMethod<
    [],
    Array<
      {
        'id' : bigint,
        'productCategory' : {
          'id' : bigint,
          'quality' : bigint,
          'name' : string,
          'description' : string,
        },
        'owner' : string,
      }
    >
  >,
  'getOrder' : ActorMethod<
    [bigint],
    {
      'id' : bigint,
      'shipper' : string,
      'status' : { 'EXPIRED' : null } |
        { 'PENDING' : null } |
        { 'CONFIRMED' : null },
      'arbiter' : string,
      'deliveryDeadline' : bigint,
      'token' : string,
      'customer' : string,
      'paymentDeadline' : bigint,
      'supplier' : string,
      'deliveryPort' : string,
      'lines' : Array<
        {
          'productCategory' : {
            'id' : bigint,
            'quality' : bigint,
            'name' : string,
            'description' : string,
          },
          'unit' : string,
          'quantity' : number,
          'price' : { 'fiat' : string, 'amount' : number },
        }
      >,
      'agreedAmount' : bigint,
      'incoterms' : string,
      'shippingPort' : string,
      'signatures' : Array<string>,
      'shippingDeadline' : bigint,
      'shipmentId' : [] | [bigint],
      'commissioner' : string,
      'documentDeliveryDeadline' : bigint,
    }
  >,
  'getOrders' : ActorMethod<
    [],
    Array<
      {
        'id' : bigint,
        'shipper' : string,
        'status' : { 'EXPIRED' : null } |
          { 'PENDING' : null } |
          { 'CONFIRMED' : null },
        'arbiter' : string,
        'deliveryDeadline' : bigint,
        'token' : string,
        'customer' : string,
        'paymentDeadline' : bigint,
        'supplier' : string,
        'deliveryPort' : string,
        'lines' : Array<
          {
            'productCategory' : {
              'id' : bigint,
              'quality' : bigint,
              'name' : string,
              'description' : string,
            },
            'unit' : string,
            'quantity' : number,
            'price' : { 'fiat' : string, 'amount' : number },
          }
        >,
        'agreedAmount' : bigint,
        'incoterms' : string,
        'shippingPort' : string,
        'signatures' : Array<string>,
        'shippingDeadline' : bigint,
        'shipmentId' : [] | [bigint],
        'commissioner' : string,
        'documentDeliveryDeadline' : bigint,
      }
    >
  >,
  'getOrganization' : ActorMethod<
    [string],
    {
      'region' : [] | [string],
      'ethAddress' : string,
      'city' : [] | [string],
      'postalCode' : [] | [string],
      'role' : [] | [
        { 'EXPORTER' : null } |
          { 'IMPORTER' : null } |
          { 'ARBITER' : null }
      ],
      'email' : [] | [string],
      'legalName' : string,
      'countryCode' : [] | [string],
      'industrialSector' : [] | [string],
      'address' : [] | [string],
      'visibilityLevel' : { 'BROAD' : null } |
        { 'NARROW' : null },
      'image' : [] | [string],
      'telephone' : [] | [string],
    }
  >,
  'getOrganizations' : ActorMethod<
    [],
    Array<
      {
        'region' : [] | [string],
        'ethAddress' : string,
        'city' : [] | [string],
        'postalCode' : [] | [string],
        'role' : [] | [
          { 'EXPORTER' : null } |
            { 'IMPORTER' : null } |
            { 'ARBITER' : null }
        ],
        'email' : [] | [string],
        'legalName' : string,
        'countryCode' : [] | [string],
        'industrialSector' : [] | [string],
        'address' : [] | [string],
        'visibilityLevel' : { 'BROAD' : null } |
          { 'NARROW' : null },
        'image' : [] | [string],
        'telephone' : [] | [string],
      }
    >
  >,
  'getPhase1Documents' : ActorMethod<
    [],
    Array<
      { 'PRE_SHIPMENT_SAMPLE' : null } |
        { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'SHIPPING_INSTRUCTIONS' : null } |
        { 'PHYTOSANITARY_CERTIFICATE' : null } |
        { 'SHIPPING_NOTE' : null } |
        { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'GENERIC' : null } |
        { 'CARGO_COLLECTION_ORDER' : null } |
        { 'BOOKING_CONFIRMATION' : null } |
        { 'BILL_OF_LADING' : null } |
        { 'TRANSPORT_CONTRACT' : null } |
        { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
        { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
        { 'EXPORT_INVOICE' : null } |
        { 'ORIGIN_CERTIFICATE_ICO' : null } |
        { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
        { 'SERVICE_GUIDE' : null } |
        { 'WEIGHT_CERTIFICATE' : null } |
        { 'EXPORT_CONFIRMATION' : null }
    >
  >,
  'getPhase1RequiredDocuments' : ActorMethod<
    [],
    Array<
      { 'PRE_SHIPMENT_SAMPLE' : null } |
        { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'SHIPPING_INSTRUCTIONS' : null } |
        { 'PHYTOSANITARY_CERTIFICATE' : null } |
        { 'SHIPPING_NOTE' : null } |
        { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'GENERIC' : null } |
        { 'CARGO_COLLECTION_ORDER' : null } |
        { 'BOOKING_CONFIRMATION' : null } |
        { 'BILL_OF_LADING' : null } |
        { 'TRANSPORT_CONTRACT' : null } |
        { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
        { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
        { 'EXPORT_INVOICE' : null } |
        { 'ORIGIN_CERTIFICATE_ICO' : null } |
        { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
        { 'SERVICE_GUIDE' : null } |
        { 'WEIGHT_CERTIFICATE' : null } |
        { 'EXPORT_CONFIRMATION' : null }
    >
  >,
  'getPhase2Documents' : ActorMethod<
    [],
    Array<
      { 'PRE_SHIPMENT_SAMPLE' : null } |
        { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'SHIPPING_INSTRUCTIONS' : null } |
        { 'PHYTOSANITARY_CERTIFICATE' : null } |
        { 'SHIPPING_NOTE' : null } |
        { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'GENERIC' : null } |
        { 'CARGO_COLLECTION_ORDER' : null } |
        { 'BOOKING_CONFIRMATION' : null } |
        { 'BILL_OF_LADING' : null } |
        { 'TRANSPORT_CONTRACT' : null } |
        { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
        { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
        { 'EXPORT_INVOICE' : null } |
        { 'ORIGIN_CERTIFICATE_ICO' : null } |
        { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
        { 'SERVICE_GUIDE' : null } |
        { 'WEIGHT_CERTIFICATE' : null } |
        { 'EXPORT_CONFIRMATION' : null }
    >
  >,
  'getPhase2RequiredDocuments' : ActorMethod<
    [],
    Array<
      { 'PRE_SHIPMENT_SAMPLE' : null } |
        { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'SHIPPING_INSTRUCTIONS' : null } |
        { 'PHYTOSANITARY_CERTIFICATE' : null } |
        { 'SHIPPING_NOTE' : null } |
        { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'GENERIC' : null } |
        { 'CARGO_COLLECTION_ORDER' : null } |
        { 'BOOKING_CONFIRMATION' : null } |
        { 'BILL_OF_LADING' : null } |
        { 'TRANSPORT_CONTRACT' : null } |
        { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
        { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
        { 'EXPORT_INVOICE' : null } |
        { 'ORIGIN_CERTIFICATE_ICO' : null } |
        { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
        { 'SERVICE_GUIDE' : null } |
        { 'WEIGHT_CERTIFICATE' : null } |
        { 'EXPORT_CONFIRMATION' : null }
    >
  >,
  'getPhase3Documents' : ActorMethod<
    [],
    Array<
      { 'PRE_SHIPMENT_SAMPLE' : null } |
        { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'SHIPPING_INSTRUCTIONS' : null } |
        { 'PHYTOSANITARY_CERTIFICATE' : null } |
        { 'SHIPPING_NOTE' : null } |
        { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'GENERIC' : null } |
        { 'CARGO_COLLECTION_ORDER' : null } |
        { 'BOOKING_CONFIRMATION' : null } |
        { 'BILL_OF_LADING' : null } |
        { 'TRANSPORT_CONTRACT' : null } |
        { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
        { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
        { 'EXPORT_INVOICE' : null } |
        { 'ORIGIN_CERTIFICATE_ICO' : null } |
        { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
        { 'SERVICE_GUIDE' : null } |
        { 'WEIGHT_CERTIFICATE' : null } |
        { 'EXPORT_CONFIRMATION' : null }
    >
  >,
  'getPhase3RequiredDocuments' : ActorMethod<
    [],
    Array<
      { 'PRE_SHIPMENT_SAMPLE' : null } |
        { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'SHIPPING_INSTRUCTIONS' : null } |
        { 'PHYTOSANITARY_CERTIFICATE' : null } |
        { 'SHIPPING_NOTE' : null } |
        { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'GENERIC' : null } |
        { 'CARGO_COLLECTION_ORDER' : null } |
        { 'BOOKING_CONFIRMATION' : null } |
        { 'BILL_OF_LADING' : null } |
        { 'TRANSPORT_CONTRACT' : null } |
        { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
        { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
        { 'EXPORT_INVOICE' : null } |
        { 'ORIGIN_CERTIFICATE_ICO' : null } |
        { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
        { 'SERVICE_GUIDE' : null } |
        { 'WEIGHT_CERTIFICATE' : null } |
        { 'EXPORT_CONFIRMATION' : null }
    >
  >,
  'getPhase4Documents' : ActorMethod<
    [],
    Array<
      { 'PRE_SHIPMENT_SAMPLE' : null } |
        { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'SHIPPING_INSTRUCTIONS' : null } |
        { 'PHYTOSANITARY_CERTIFICATE' : null } |
        { 'SHIPPING_NOTE' : null } |
        { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'GENERIC' : null } |
        { 'CARGO_COLLECTION_ORDER' : null } |
        { 'BOOKING_CONFIRMATION' : null } |
        { 'BILL_OF_LADING' : null } |
        { 'TRANSPORT_CONTRACT' : null } |
        { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
        { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
        { 'EXPORT_INVOICE' : null } |
        { 'ORIGIN_CERTIFICATE_ICO' : null } |
        { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
        { 'SERVICE_GUIDE' : null } |
        { 'WEIGHT_CERTIFICATE' : null } |
        { 'EXPORT_CONFIRMATION' : null }
    >
  >,
  'getPhase4RequiredDocuments' : ActorMethod<
    [],
    Array<
      { 'PRE_SHIPMENT_SAMPLE' : null } |
        { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'SHIPPING_INSTRUCTIONS' : null } |
        { 'PHYTOSANITARY_CERTIFICATE' : null } |
        { 'SHIPPING_NOTE' : null } |
        { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'GENERIC' : null } |
        { 'CARGO_COLLECTION_ORDER' : null } |
        { 'BOOKING_CONFIRMATION' : null } |
        { 'BILL_OF_LADING' : null } |
        { 'TRANSPORT_CONTRACT' : null } |
        { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
        { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
        { 'EXPORT_INVOICE' : null } |
        { 'ORIGIN_CERTIFICATE_ICO' : null } |
        { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
        { 'SERVICE_GUIDE' : null } |
        { 'WEIGHT_CERTIFICATE' : null } |
        { 'EXPORT_CONFIRMATION' : null }
    >
  >,
  'getPhase5Documents' : ActorMethod<
    [],
    Array<
      { 'PRE_SHIPMENT_SAMPLE' : null } |
        { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'SHIPPING_INSTRUCTIONS' : null } |
        { 'PHYTOSANITARY_CERTIFICATE' : null } |
        { 'SHIPPING_NOTE' : null } |
        { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'GENERIC' : null } |
        { 'CARGO_COLLECTION_ORDER' : null } |
        { 'BOOKING_CONFIRMATION' : null } |
        { 'BILL_OF_LADING' : null } |
        { 'TRANSPORT_CONTRACT' : null } |
        { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
        { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
        { 'EXPORT_INVOICE' : null } |
        { 'ORIGIN_CERTIFICATE_ICO' : null } |
        { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
        { 'SERVICE_GUIDE' : null } |
        { 'WEIGHT_CERTIFICATE' : null } |
        { 'EXPORT_CONFIRMATION' : null }
    >
  >,
  'getPhase5RequiredDocuments' : ActorMethod<
    [],
    Array<
      { 'PRE_SHIPMENT_SAMPLE' : null } |
        { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'SHIPPING_INSTRUCTIONS' : null } |
        { 'PHYTOSANITARY_CERTIFICATE' : null } |
        { 'SHIPPING_NOTE' : null } |
        { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'GENERIC' : null } |
        { 'CARGO_COLLECTION_ORDER' : null } |
        { 'BOOKING_CONFIRMATION' : null } |
        { 'BILL_OF_LADING' : null } |
        { 'TRANSPORT_CONTRACT' : null } |
        { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
        { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
        { 'EXPORT_INVOICE' : null } |
        { 'ORIGIN_CERTIFICATE_ICO' : null } |
        { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
        { 'SERVICE_GUIDE' : null } |
        { 'WEIGHT_CERTIFICATE' : null } |
        { 'EXPORT_CONFIRMATION' : null }
    >
  >,
  'getProductCategories' : ActorMethod<
    [],
    Array<
      {
        'id' : bigint,
        'quality' : bigint,
        'name' : string,
        'description' : string,
      }
    >
  >,
  'getProductCategory' : ActorMethod<
    [bigint],
    {
      'id' : bigint,
      'quality' : bigint,
      'name' : string,
      'description' : string,
    }
  >,
  'getRequiredDocuments' : ActorMethod<
    [
      { 'ARBITRATION' : null } |
        { 'PHASE_1' : null } |
        { 'PHASE_2' : null } |
        { 'PHASE_3' : null } |
        { 'PHASE_4' : null } |
        { 'PHASE_5' : null } |
        { 'CONFIRMED' : null },
    ],
    Array<
      { 'PRE_SHIPMENT_SAMPLE' : null } |
        { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'SHIPPING_INSTRUCTIONS' : null } |
        { 'PHYTOSANITARY_CERTIFICATE' : null } |
        { 'SHIPPING_NOTE' : null } |
        { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'GENERIC' : null } |
        { 'CARGO_COLLECTION_ORDER' : null } |
        { 'BOOKING_CONFIRMATION' : null } |
        { 'BILL_OF_LADING' : null } |
        { 'TRANSPORT_CONTRACT' : null } |
        { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
        { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
        { 'EXPORT_INVOICE' : null } |
        { 'ORIGIN_CERTIFICATE_ICO' : null } |
        { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
        { 'SERVICE_GUIDE' : null } |
        { 'WEIGHT_CERTIFICATE' : null } |
        { 'EXPORT_CONFIRMATION' : null }
    >
  >,
  'getShipment' : ActorMethod<
    [bigint],
    {
      'id' : bigint,
      'sampleApprovalRequired' : boolean,
      'documents' : Array<
        [
          { 'PRE_SHIPMENT_SAMPLE' : null } |
            { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'SHIPPING_INSTRUCTIONS' : null } |
            { 'PHYTOSANITARY_CERTIFICATE' : null } |
            { 'SHIPPING_NOTE' : null } |
            { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'GENERIC' : null } |
            { 'CARGO_COLLECTION_ORDER' : null } |
            { 'BOOKING_CONFIRMATION' : null } |
            { 'BILL_OF_LADING' : null } |
            { 'TRANSPORT_CONTRACT' : null } |
            { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
            { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
            { 'EXPORT_INVOICE' : null } |
            { 'ORIGIN_CERTIFICATE_ICO' : null } |
            { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
            { 'SERVICE_GUIDE' : null } |
            { 'WEIGHT_CERTIFICATE' : null } |
            { 'EXPORT_CONFIRMATION' : null },
          Array<
            {
              'id' : bigint,
              'documentType' : { 'PRE_SHIPMENT_SAMPLE' : null } |
                { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'SHIPPING_INSTRUCTIONS' : null } |
                { 'PHYTOSANITARY_CERTIFICATE' : null } |
                { 'SHIPPING_NOTE' : null } |
                { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'GENERIC' : null } |
                { 'CARGO_COLLECTION_ORDER' : null } |
                { 'BOOKING_CONFIRMATION' : null } |
                { 'BILL_OF_LADING' : null } |
                { 'TRANSPORT_CONTRACT' : null } |
                { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
                { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
                { 'EXPORT_INVOICE' : null } |
                { 'ORIGIN_CERTIFICATE_ICO' : null } |
                { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
                { 'SERVICE_GUIDE' : null } |
                { 'WEIGHT_CERTIFICATE' : null } |
                { 'EXPORT_CONFIRMATION' : null },
              'externalUrl' : string,
              'evaluationStatus' : { 'NOT_APPROVED' : null } |
                { 'NOT_EVALUATED' : null } |
                { 'APPROVED' : null },
              'uploadedBy' : string,
            }
          >,
        ]
      >,
      'qualityEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'fundsStatus' : { 'LOCKED' : null } |
        { 'RELEASED' : null } |
        { 'NOT_LOCKED' : null },
      'supplier' : string,
      'netWeight' : bigint,
      'fixingDate' : bigint,
      'detailsSet' : boolean,
      'containersNumber' : bigint,
      'shipmentNumber' : bigint,
      'grossWeight' : bigint,
      'expirationDate' : bigint,
      'quantity' : bigint,
      'sampleEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'differentialApplied' : bigint,
      'price' : bigint,
      'targetExchange' : string,
      'commissioner' : string,
      'detailsEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'escrowAddress' : [] | [string],
    }
  >,
  'getShipmentPhase' : ActorMethod<
    [bigint],
    { 'ARBITRATION' : null } |
      { 'PHASE_1' : null } |
      { 'PHASE_2' : null } |
      { 'PHASE_3' : null } |
      { 'PHASE_4' : null } |
      { 'PHASE_5' : null } |
      { 'CONFIRMED' : null }
  >,
  'getShipments' : ActorMethod<
    [],
    Array<
      {
        'id' : bigint,
        'sampleApprovalRequired' : boolean,
        'documents' : Array<
          [
            { 'PRE_SHIPMENT_SAMPLE' : null } |
              { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
              { 'SHIPPING_INSTRUCTIONS' : null } |
              { 'PHYTOSANITARY_CERTIFICATE' : null } |
              { 'SHIPPING_NOTE' : null } |
              { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
              { 'GENERIC' : null } |
              { 'CARGO_COLLECTION_ORDER' : null } |
              { 'BOOKING_CONFIRMATION' : null } |
              { 'BILL_OF_LADING' : null } |
              { 'TRANSPORT_CONTRACT' : null } |
              { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
              { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
              { 'EXPORT_INVOICE' : null } |
              { 'ORIGIN_CERTIFICATE_ICO' : null } |
              { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
              { 'SERVICE_GUIDE' : null } |
              { 'WEIGHT_CERTIFICATE' : null } |
              { 'EXPORT_CONFIRMATION' : null },
            Array<
              {
                'id' : bigint,
                'documentType' : { 'PRE_SHIPMENT_SAMPLE' : null } |
                  { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
                  { 'SHIPPING_INSTRUCTIONS' : null } |
                  { 'PHYTOSANITARY_CERTIFICATE' : null } |
                  { 'SHIPPING_NOTE' : null } |
                  { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
                  { 'GENERIC' : null } |
                  { 'CARGO_COLLECTION_ORDER' : null } |
                  { 'BOOKING_CONFIRMATION' : null } |
                  { 'BILL_OF_LADING' : null } |
                  { 'TRANSPORT_CONTRACT' : null } |
                  { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
                  { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
                  { 'EXPORT_INVOICE' : null } |
                  { 'ORIGIN_CERTIFICATE_ICO' : null } |
                  { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
                  { 'SERVICE_GUIDE' : null } |
                  { 'WEIGHT_CERTIFICATE' : null } |
                  { 'EXPORT_CONFIRMATION' : null },
                'externalUrl' : string,
                'evaluationStatus' : { 'NOT_APPROVED' : null } |
                  { 'NOT_EVALUATED' : null } |
                  { 'APPROVED' : null },
                'uploadedBy' : string,
              }
            >,
          ]
        >,
        'qualityEvaluationStatus' : { 'NOT_APPROVED' : null } |
          { 'NOT_EVALUATED' : null } |
          { 'APPROVED' : null },
        'fundsStatus' : { 'LOCKED' : null } |
          { 'RELEASED' : null } |
          { 'NOT_LOCKED' : null },
        'supplier' : string,
        'netWeight' : bigint,
        'fixingDate' : bigint,
        'detailsSet' : boolean,
        'containersNumber' : bigint,
        'shipmentNumber' : bigint,
        'grossWeight' : bigint,
        'expirationDate' : bigint,
        'quantity' : bigint,
        'sampleEvaluationStatus' : { 'NOT_APPROVED' : null } |
          { 'NOT_EVALUATED' : null } |
          { 'APPROVED' : null },
        'differentialApplied' : bigint,
        'price' : bigint,
        'targetExchange' : string,
        'commissioner' : string,
        'detailsEvaluationStatus' : { 'NOT_APPROVED' : null } |
          { 'NOT_EVALUATED' : null } |
          { 'APPROVED' : null },
        'escrowAddress' : [] | [string],
      }
    >
  >,
  'getUploadableDocuments' : ActorMethod<
    [
      { 'ARBITRATION' : null } |
        { 'PHASE_1' : null } |
        { 'PHASE_2' : null } |
        { 'PHASE_3' : null } |
        { 'PHASE_4' : null } |
        { 'PHASE_5' : null } |
        { 'CONFIRMED' : null },
    ],
    Array<
      { 'PRE_SHIPMENT_SAMPLE' : null } |
        { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'SHIPPING_INSTRUCTIONS' : null } |
        { 'PHYTOSANITARY_CERTIFICATE' : null } |
        { 'SHIPPING_NOTE' : null } |
        { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
        { 'GENERIC' : null } |
        { 'CARGO_COLLECTION_ORDER' : null } |
        { 'BOOKING_CONFIRMATION' : null } |
        { 'BILL_OF_LADING' : null } |
        { 'TRANSPORT_CONTRACT' : null } |
        { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
        { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
        { 'EXPORT_INVOICE' : null } |
        { 'ORIGIN_CERTIFICATE_ICO' : null } |
        { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
        { 'SERVICE_GUIDE' : null } |
        { 'WEIGHT_CERTIFICATE' : null } |
        { 'EXPORT_CONFIRMATION' : null }
    >
  >,
  'lockFunds' : ActorMethod<
    [bigint],
    {
      'id' : bigint,
      'sampleApprovalRequired' : boolean,
      'documents' : Array<
        [
          { 'PRE_SHIPMENT_SAMPLE' : null } |
            { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'SHIPPING_INSTRUCTIONS' : null } |
            { 'PHYTOSANITARY_CERTIFICATE' : null } |
            { 'SHIPPING_NOTE' : null } |
            { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'GENERIC' : null } |
            { 'CARGO_COLLECTION_ORDER' : null } |
            { 'BOOKING_CONFIRMATION' : null } |
            { 'BILL_OF_LADING' : null } |
            { 'TRANSPORT_CONTRACT' : null } |
            { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
            { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
            { 'EXPORT_INVOICE' : null } |
            { 'ORIGIN_CERTIFICATE_ICO' : null } |
            { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
            { 'SERVICE_GUIDE' : null } |
            { 'WEIGHT_CERTIFICATE' : null } |
            { 'EXPORT_CONFIRMATION' : null },
          Array<
            {
              'id' : bigint,
              'documentType' : { 'PRE_SHIPMENT_SAMPLE' : null } |
                { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'SHIPPING_INSTRUCTIONS' : null } |
                { 'PHYTOSANITARY_CERTIFICATE' : null } |
                { 'SHIPPING_NOTE' : null } |
                { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'GENERIC' : null } |
                { 'CARGO_COLLECTION_ORDER' : null } |
                { 'BOOKING_CONFIRMATION' : null } |
                { 'BILL_OF_LADING' : null } |
                { 'TRANSPORT_CONTRACT' : null } |
                { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
                { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
                { 'EXPORT_INVOICE' : null } |
                { 'ORIGIN_CERTIFICATE_ICO' : null } |
                { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
                { 'SERVICE_GUIDE' : null } |
                { 'WEIGHT_CERTIFICATE' : null } |
                { 'EXPORT_CONFIRMATION' : null },
              'externalUrl' : string,
              'evaluationStatus' : { 'NOT_APPROVED' : null } |
                { 'NOT_EVALUATED' : null } |
                { 'APPROVED' : null },
              'uploadedBy' : string,
            }
          >,
        ]
      >,
      'qualityEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'fundsStatus' : { 'LOCKED' : null } |
        { 'RELEASED' : null } |
        { 'NOT_LOCKED' : null },
      'supplier' : string,
      'netWeight' : bigint,
      'fixingDate' : bigint,
      'detailsSet' : boolean,
      'containersNumber' : bigint,
      'shipmentNumber' : bigint,
      'grossWeight' : bigint,
      'expirationDate' : bigint,
      'quantity' : bigint,
      'sampleEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'differentialApplied' : bigint,
      'price' : bigint,
      'targetExchange' : string,
      'commissioner' : string,
      'detailsEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'escrowAddress' : [] | [string],
    }
  >,
  'logout' : ActorMethod<[], undefined>,
  'setShipmentDetails' : ActorMethod<
    [
      bigint,
      bigint,
      bigint,
      bigint,
      string,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
    ],
    {
      'id' : bigint,
      'sampleApprovalRequired' : boolean,
      'documents' : Array<
        [
          { 'PRE_SHIPMENT_SAMPLE' : null } |
            { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'SHIPPING_INSTRUCTIONS' : null } |
            { 'PHYTOSANITARY_CERTIFICATE' : null } |
            { 'SHIPPING_NOTE' : null } |
            { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'GENERIC' : null } |
            { 'CARGO_COLLECTION_ORDER' : null } |
            { 'BOOKING_CONFIRMATION' : null } |
            { 'BILL_OF_LADING' : null } |
            { 'TRANSPORT_CONTRACT' : null } |
            { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
            { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
            { 'EXPORT_INVOICE' : null } |
            { 'ORIGIN_CERTIFICATE_ICO' : null } |
            { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
            { 'SERVICE_GUIDE' : null } |
            { 'WEIGHT_CERTIFICATE' : null } |
            { 'EXPORT_CONFIRMATION' : null },
          Array<
            {
              'id' : bigint,
              'documentType' : { 'PRE_SHIPMENT_SAMPLE' : null } |
                { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'SHIPPING_INSTRUCTIONS' : null } |
                { 'PHYTOSANITARY_CERTIFICATE' : null } |
                { 'SHIPPING_NOTE' : null } |
                { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'GENERIC' : null } |
                { 'CARGO_COLLECTION_ORDER' : null } |
                { 'BOOKING_CONFIRMATION' : null } |
                { 'BILL_OF_LADING' : null } |
                { 'TRANSPORT_CONTRACT' : null } |
                { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
                { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
                { 'EXPORT_INVOICE' : null } |
                { 'ORIGIN_CERTIFICATE_ICO' : null } |
                { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
                { 'SERVICE_GUIDE' : null } |
                { 'WEIGHT_CERTIFICATE' : null } |
                { 'EXPORT_CONFIRMATION' : null },
              'externalUrl' : string,
              'evaluationStatus' : { 'NOT_APPROVED' : null } |
                { 'NOT_EVALUATED' : null } |
                { 'APPROVED' : null },
              'uploadedBy' : string,
            }
          >,
        ]
      >,
      'qualityEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'fundsStatus' : { 'LOCKED' : null } |
        { 'RELEASED' : null } |
        { 'NOT_LOCKED' : null },
      'supplier' : string,
      'netWeight' : bigint,
      'fixingDate' : bigint,
      'detailsSet' : boolean,
      'containersNumber' : bigint,
      'shipmentNumber' : bigint,
      'grossWeight' : bigint,
      'expirationDate' : bigint,
      'quantity' : bigint,
      'sampleEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'differentialApplied' : bigint,
      'price' : bigint,
      'targetExchange' : string,
      'commissioner' : string,
      'detailsEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'escrowAddress' : [] | [string],
    }
  >,
  'signOrder' : ActorMethod<
    [bigint],
    {
      'id' : bigint,
      'shipper' : string,
      'status' : { 'EXPIRED' : null } |
        { 'PENDING' : null } |
        { 'CONFIRMED' : null },
      'arbiter' : string,
      'deliveryDeadline' : bigint,
      'token' : string,
      'customer' : string,
      'paymentDeadline' : bigint,
      'supplier' : string,
      'deliveryPort' : string,
      'lines' : Array<
        {
          'productCategory' : {
            'id' : bigint,
            'quality' : bigint,
            'name' : string,
            'description' : string,
          },
          'unit' : string,
          'quantity' : number,
          'price' : { 'fiat' : string, 'amount' : number },
        }
      >,
      'agreedAmount' : bigint,
      'incoterms' : string,
      'shippingPort' : string,
      'signatures' : Array<string>,
      'shippingDeadline' : bigint,
      'shipmentId' : [] | [bigint],
      'commissioner' : string,
      'documentDeliveryDeadline' : bigint,
    }
  >,
  'unlockFunds' : ActorMethod<
    [bigint],
    {
      'id' : bigint,
      'sampleApprovalRequired' : boolean,
      'documents' : Array<
        [
          { 'PRE_SHIPMENT_SAMPLE' : null } |
            { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'SHIPPING_INSTRUCTIONS' : null } |
            { 'PHYTOSANITARY_CERTIFICATE' : null } |
            { 'SHIPPING_NOTE' : null } |
            { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'GENERIC' : null } |
            { 'CARGO_COLLECTION_ORDER' : null } |
            { 'BOOKING_CONFIRMATION' : null } |
            { 'BILL_OF_LADING' : null } |
            { 'TRANSPORT_CONTRACT' : null } |
            { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
            { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
            { 'EXPORT_INVOICE' : null } |
            { 'ORIGIN_CERTIFICATE_ICO' : null } |
            { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
            { 'SERVICE_GUIDE' : null } |
            { 'WEIGHT_CERTIFICATE' : null } |
            { 'EXPORT_CONFIRMATION' : null },
          Array<
            {
              'id' : bigint,
              'documentType' : { 'PRE_SHIPMENT_SAMPLE' : null } |
                { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'SHIPPING_INSTRUCTIONS' : null } |
                { 'PHYTOSANITARY_CERTIFICATE' : null } |
                { 'SHIPPING_NOTE' : null } |
                { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'GENERIC' : null } |
                { 'CARGO_COLLECTION_ORDER' : null } |
                { 'BOOKING_CONFIRMATION' : null } |
                { 'BILL_OF_LADING' : null } |
                { 'TRANSPORT_CONTRACT' : null } |
                { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
                { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
                { 'EXPORT_INVOICE' : null } |
                { 'ORIGIN_CERTIFICATE_ICO' : null } |
                { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
                { 'SERVICE_GUIDE' : null } |
                { 'WEIGHT_CERTIFICATE' : null } |
                { 'EXPORT_CONFIRMATION' : null },
              'externalUrl' : string,
              'evaluationStatus' : { 'NOT_APPROVED' : null } |
                { 'NOT_EVALUATED' : null } |
                { 'APPROVED' : null },
              'uploadedBy' : string,
            }
          >,
        ]
      >,
      'qualityEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'fundsStatus' : { 'LOCKED' : null } |
        { 'RELEASED' : null } |
        { 'NOT_LOCKED' : null },
      'supplier' : string,
      'netWeight' : bigint,
      'fixingDate' : bigint,
      'detailsSet' : boolean,
      'containersNumber' : bigint,
      'shipmentNumber' : bigint,
      'grossWeight' : bigint,
      'expirationDate' : bigint,
      'quantity' : bigint,
      'sampleEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'differentialApplied' : bigint,
      'price' : bigint,
      'targetExchange' : string,
      'commissioner' : string,
      'detailsEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'escrowAddress' : [] | [string],
    }
  >,
  'updateDocument' : ActorMethod<
    [bigint, bigint, string],
    {
      'id' : bigint,
      'sampleApprovalRequired' : boolean,
      'documents' : Array<
        [
          { 'PRE_SHIPMENT_SAMPLE' : null } |
            { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'SHIPPING_INSTRUCTIONS' : null } |
            { 'PHYTOSANITARY_CERTIFICATE' : null } |
            { 'SHIPPING_NOTE' : null } |
            { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
            { 'GENERIC' : null } |
            { 'CARGO_COLLECTION_ORDER' : null } |
            { 'BOOKING_CONFIRMATION' : null } |
            { 'BILL_OF_LADING' : null } |
            { 'TRANSPORT_CONTRACT' : null } |
            { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
            { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
            { 'EXPORT_INVOICE' : null } |
            { 'ORIGIN_CERTIFICATE_ICO' : null } |
            { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
            { 'SERVICE_GUIDE' : null } |
            { 'WEIGHT_CERTIFICATE' : null } |
            { 'EXPORT_CONFIRMATION' : null },
          Array<
            {
              'id' : bigint,
              'documentType' : { 'PRE_SHIPMENT_SAMPLE' : null } |
                { 'FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'SHIPPING_INSTRUCTIONS' : null } |
                { 'PHYTOSANITARY_CERTIFICATE' : null } |
                { 'SHIPPING_NOTE' : null } |
                { 'TO_BE_FREED_SINGLE_EXPORT_DECLARATION' : null } |
                { 'GENERIC' : null } |
                { 'CARGO_COLLECTION_ORDER' : null } |
                { 'BOOKING_CONFIRMATION' : null } |
                { 'BILL_OF_LADING' : null } |
                { 'TRANSPORT_CONTRACT' : null } |
                { 'CONTAINER_PROOF_OF_DELIVERY' : null } |
                { 'SENSORY_EVALUATION_ANALYSIS_REPORT' : null } |
                { 'EXPORT_INVOICE' : null } |
                { 'ORIGIN_CERTIFICATE_ICO' : null } |
                { 'SUBJECT_TO_APPROVAL_OF_SAMPLE' : null } |
                { 'SERVICE_GUIDE' : null } |
                { 'WEIGHT_CERTIFICATE' : null } |
                { 'EXPORT_CONFIRMATION' : null },
              'externalUrl' : string,
              'evaluationStatus' : { 'NOT_APPROVED' : null } |
                { 'NOT_EVALUATED' : null } |
                { 'APPROVED' : null },
              'uploadedBy' : string,
            }
          >,
        ]
      >,
      'qualityEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'fundsStatus' : { 'LOCKED' : null } |
        { 'RELEASED' : null } |
        { 'NOT_LOCKED' : null },
      'supplier' : string,
      'netWeight' : bigint,
      'fixingDate' : bigint,
      'detailsSet' : boolean,
      'containersNumber' : bigint,
      'shipmentNumber' : bigint,
      'grossWeight' : bigint,
      'expirationDate' : bigint,
      'quantity' : bigint,
      'sampleEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'differentialApplied' : bigint,
      'price' : bigint,
      'targetExchange' : string,
      'commissioner' : string,
      'detailsEvaluationStatus' : { 'NOT_APPROVED' : null } |
        { 'NOT_EVALUATED' : null } |
        { 'APPROVED' : null },
      'escrowAddress' : [] | [string],
    }
  >,
  'updateMaterial' : ActorMethod<
    [bigint, bigint],
    {
      'id' : bigint,
      'productCategory' : {
        'id' : bigint,
        'quality' : bigint,
        'name' : string,
        'description' : string,
      },
    }
  >,
  'updateOrder' : ActorMethod<
    [
      bigint,
      string,
      string,
      string,
      bigint,
      bigint,
      bigint,
      bigint,
      string,
      string,
      bigint,
      string,
      string,
      string,
      string,
      Array<
        {
          'productCategoryId' : bigint,
          'unit' : string,
          'quantity' : number,
          'price' : { 'fiat' : string, 'amount' : number },
        }
      >,
    ],
    {
      'id' : bigint,
      'shipper' : string,
      'status' : { 'EXPIRED' : null } |
        { 'PENDING' : null } |
        { 'CONFIRMED' : null },
      'arbiter' : string,
      'deliveryDeadline' : bigint,
      'token' : string,
      'customer' : string,
      'paymentDeadline' : bigint,
      'supplier' : string,
      'deliveryPort' : string,
      'lines' : Array<
        {
          'productCategory' : {
            'id' : bigint,
            'quality' : bigint,
            'name' : string,
            'description' : string,
          },
          'unit' : string,
          'quantity' : number,
          'price' : { 'fiat' : string, 'amount' : number },
        }
      >,
      'agreedAmount' : bigint,
      'incoterms' : string,
      'shippingPort' : string,
      'signatures' : Array<string>,
      'shippingDeadline' : bigint,
      'shipmentId' : [] | [bigint],
      'commissioner' : string,
      'documentDeliveryDeadline' : bigint,
    }
  >,
  'updateOrganization' : ActorMethod<
    [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      { 'EXPORTER' : null } |
        { 'IMPORTER' : null } |
        { 'ARBITER' : null },
      string,
      string,
      string,
    ],
    {
      'region' : [] | [string],
      'ethAddress' : string,
      'city' : [] | [string],
      'postalCode' : [] | [string],
      'role' : [] | [
        { 'EXPORTER' : null } |
          { 'IMPORTER' : null } |
          { 'ARBITER' : null }
      ],
      'email' : [] | [string],
      'legalName' : string,
      'countryCode' : [] | [string],
      'industrialSector' : [] | [string],
      'address' : [] | [string],
      'visibilityLevel' : { 'BROAD' : null } |
        { 'NARROW' : null },
      'image' : [] | [string],
      'telephone' : [] | [string],
    }
  >,
  'updateProductCategory' : ActorMethod<
    [bigint, string, bigint, string],
    {
      'id' : bigint,
      'quality' : bigint,
      'name' : string,
      'description' : string,
    }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
