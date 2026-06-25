import type {
  ListDocumentsInput,
  ListDocumentsResponse,
  UploadDocumentInput,
  UploadDocumentResponse,
  DeleteDocumentInput,
  DeleteDocumentResponse,
  OpenDocumentInput,
  OpenDocumentResponse,
} from '../../shared/ipc'

export const documentsApi = {
  listByPractice: (input: ListDocumentsInput): Promise<ListDocumentsResponse> =>
    window.api.documents.listByPractice(input),

  upload: (input: UploadDocumentInput): Promise<UploadDocumentResponse> =>
    window.api.documents.upload(input),

  delete: (input: DeleteDocumentInput): Promise<DeleteDocumentResponse> =>
    window.api.documents.delete(input),

  open: (input: OpenDocumentInput): Promise<OpenDocumentResponse> =>
    window.api.documents.open(input),
}
