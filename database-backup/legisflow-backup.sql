--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.workflow_transitions DROP CONSTRAINT IF EXISTS "workflow_transitions_workflowId_fkey";
ALTER TABLE IF EXISTS ONLY public.workflow_transitions DROP CONSTRAINT IF EXISTS "workflow_transitions_toStepId_fkey";
ALTER TABLE IF EXISTS ONLY public.workflow_transitions DROP CONSTRAINT IF EXISTS "workflow_transitions_fromStepId_fkey";
ALTER TABLE IF EXISTS ONLY public.workflow_steps DROP CONSTRAINT IF EXISTS "workflow_steps_workflowId_fkey";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "users_updatedById_fkey";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "users_createdById_fkey";
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS "user_roles_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS "user_roles_roleId_fkey";
ALTER TABLE IF EXISTS ONLY public.template_variables DROP CONSTRAINT IF EXISTS "template_variables_templateId_fkey";
ALTER TABLE IF EXISTS ONLY public.system_notifications DROP CONSTRAINT IF EXISTS "system_notifications_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.step_histories DROP CONSTRAINT IF EXISTS "step_histories_stepId_fkey";
ALTER TABLE IF EXISTS ONLY public.step_histories DROP CONSTRAINT IF EXISTS "step_histories_documentWorkflowId_fkey";
ALTER TABLE IF EXISTS ONLY public.step_histories DROP CONSTRAINT IF EXISTS "step_histories_actionById_fkey";
ALTER TABLE IF EXISTS ONLY public.step_assignments DROP CONSTRAINT IF EXISTS "step_assignments_stepId_fkey";
ALTER TABLE IF EXISTS ONLY public.step_assignments DROP CONSTRAINT IF EXISTS "step_assignments_documentWorkflowId_fkey";
ALTER TABLE IF EXISTS ONLY public.step_assignments DROP CONSTRAINT IF EXISTS "step_assignments_assignedToId_fkey";
ALTER TABLE IF EXISTS ONLY public.step_assignments DROP CONSTRAINT IF EXISTS "step_assignments_assignedById_fkey";
ALTER TABLE IF EXISTS ONLY public.signatures DROP CONSTRAINT IF EXISTS "signatures_versionId_fkey";
ALTER TABLE IF EXISTS ONLY public.signatures DROP CONSTRAINT IF EXISTS "signatures_signedById_fkey";
ALTER TABLE IF EXISTS ONLY public.signatures DROP CONSTRAINT IF EXISTS "signatures_documentId_fkey";
ALTER TABLE IF EXISTS ONLY public.signatures DROP CONSTRAINT IF EXISTS "signatures_certificateId_fkey";
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS "role_permissions_roleId_fkey";
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS "role_permissions_permissionId_fkey";
ALTER TABLE IF EXISTS ONLY public.organizations DROP CONSTRAINT IF EXISTS "organizations_parentId_fkey";
ALTER TABLE IF EXISTS ONLY public.organization_users DROP CONSTRAINT IF EXISTS "organization_users_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.organization_users DROP CONSTRAINT IF EXISTS "organization_users_organizationId_fkey";
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS "notifications_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.notification_preferences DROP CONSTRAINT IF EXISTS "notification_preferences_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS "documents_parentDocumentId_fkey";
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS "documents_ownerOrganizationId_fkey";
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS "documents_lastModifiedById_fkey";
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS "documents_documentTypeId_fkey";
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS "documents_createdById_fkey";
ALTER TABLE IF EXISTS ONLY public.document_workflows DROP CONSTRAINT IF EXISTS "document_workflows_workflowId_fkey";
ALTER TABLE IF EXISTS ONLY public.document_workflows DROP CONSTRAINT IF EXISTS "document_workflows_documentId_fkey";
ALTER TABLE IF EXISTS ONLY public.document_workflows DROP CONSTRAINT IF EXISTS "document_workflows_currentStepId_fkey";
ALTER TABLE IF EXISTS ONLY public.document_versions DROP CONSTRAINT IF EXISTS "document_versions_documentId_fkey";
ALTER TABLE IF EXISTS ONLY public.document_versions DROP CONSTRAINT IF EXISTS "document_versions_createdById_fkey";
ALTER TABLE IF EXISTS ONLY public.document_types DROP CONSTRAINT IF EXISTS "document_types_workflowId_fkey";
ALTER TABLE IF EXISTS ONLY public.document_types DROP CONSTRAINT IF EXISTS "document_types_templateId_fkey";
ALTER TABLE IF EXISTS ONLY public.document_templates DROP CONSTRAINT IF EXISTS "document_templates_updatedById_fkey";
ALTER TABLE IF EXISTS ONLY public.document_templates DROP CONSTRAINT IF EXISTS "document_templates_documentTypeId_fkey";
ALTER TABLE IF EXISTS ONLY public.document_templates DROP CONSTRAINT IF EXISTS "document_templates_createdById_fkey";
ALTER TABLE IF EXISTS ONLY public.document_files DROP CONSTRAINT IF EXISTS "document_files_documentVersionId_fkey";
ALTER TABLE IF EXISTS ONLY public.document_comments DROP CONSTRAINT IF EXISTS "document_comments_versionId_fkey";
ALTER TABLE IF EXISTS ONLY public.document_comments DROP CONSTRAINT IF EXISTS "document_comments_resolvedById_fkey";
ALTER TABLE IF EXISTS ONLY public.document_comments DROP CONSTRAINT IF EXISTS "document_comments_parentCommentId_fkey";
ALTER TABLE IF EXISTS ONLY public.document_comments DROP CONSTRAINT IF EXISTS "document_comments_documentId_fkey";
ALTER TABLE IF EXISTS ONLY public.document_comments DROP CONSTRAINT IF EXISTS "document_comments_createdById_fkey";
ALTER TABLE IF EXISTS ONLY public.document_attachments DROP CONSTRAINT IF EXISTS "document_attachments_uploadedById_fkey";
ALTER TABLE IF EXISTS ONLY public.document_attachments DROP CONSTRAINT IF EXISTS "document_attachments_documentId_fkey";
ALTER TABLE IF EXISTS ONLY public.certificates DROP CONSTRAINT IF EXISTS "certificates_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS "audit_logs_userId_fkey";
DROP INDEX IF EXISTS public.users_username_key;
DROP INDEX IF EXISTS public.users_email_key;
DROP INDEX IF EXISTS public."template_variables_templateId_key_key";
DROP INDEX IF EXISTS public.roles_name_key;
DROP INDEX IF EXISTS public.permissions_code_key;
DROP INDEX IF EXISTS public."notifications_userId_isRead_idx";
DROP INDEX IF EXISTS public."notifications_createdAt_idx";
DROP INDEX IF EXISTS public."notification_preferences_userId_key";
DROP INDEX IF EXISTS public."documents_referenceNumber_key";
DROP INDEX IF EXISTS public."document_workflows_documentId_key";
DROP INDEX IF EXISTS public."document_versions_documentId_versionNumber_key";
DROP INDEX IF EXISTS public."document_files_documentVersionId_format_key";
ALTER TABLE IF EXISTS ONLY public.workflows DROP CONSTRAINT IF EXISTS workflows_pkey;
ALTER TABLE IF EXISTS ONLY public.workflow_transitions DROP CONSTRAINT IF EXISTS workflow_transitions_pkey;
ALTER TABLE IF EXISTS ONLY public.workflow_steps DROP CONSTRAINT IF EXISTS workflow_steps_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.template_variables DROP CONSTRAINT IF EXISTS template_variables_pkey;
ALTER TABLE IF EXISTS ONLY public.system_notifications DROP CONSTRAINT IF EXISTS system_notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.step_histories DROP CONSTRAINT IF EXISTS step_histories_pkey;
ALTER TABLE IF EXISTS ONLY public.step_assignments DROP CONSTRAINT IF EXISTS step_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.signatures DROP CONSTRAINT IF EXISTS signatures_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.organizations DROP CONSTRAINT IF EXISTS organizations_pkey;
ALTER TABLE IF EXISTS ONLY public.organization_users DROP CONSTRAINT IF EXISTS organization_users_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_pkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_pkey;
ALTER TABLE IF EXISTS ONLY public.document_workflows DROP CONSTRAINT IF EXISTS document_workflows_pkey;
ALTER TABLE IF EXISTS ONLY public.document_versions DROP CONSTRAINT IF EXISTS document_versions_pkey;
ALTER TABLE IF EXISTS ONLY public.document_types DROP CONSTRAINT IF EXISTS document_types_pkey;
ALTER TABLE IF EXISTS ONLY public.document_templates DROP CONSTRAINT IF EXISTS document_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.document_files DROP CONSTRAINT IF EXISTS document_files_pkey;
ALTER TABLE IF EXISTS ONLY public.document_comments DROP CONSTRAINT IF EXISTS document_comments_pkey;
ALTER TABLE IF EXISTS ONLY public.document_attachments DROP CONSTRAINT IF EXISTS document_attachments_pkey;
ALTER TABLE IF EXISTS ONLY public.certificates DROP CONSTRAINT IF EXISTS certificates_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
DROP TABLE IF EXISTS public.workflows;
DROP TABLE IF EXISTS public.workflow_transitions;
DROP TABLE IF EXISTS public.workflow_steps;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_roles;
DROP TABLE IF EXISTS public.template_variables;
DROP TABLE IF EXISTS public.system_notifications;
DROP TABLE IF EXISTS public.step_histories;
DROP TABLE IF EXISTS public.step_assignments;
DROP TABLE IF EXISTS public.signatures;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.role_permissions;
DROP TABLE IF EXISTS public.permissions;
DROP TABLE IF EXISTS public.organizations;
DROP TABLE IF EXISTS public.organization_users;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.notification_preferences;
DROP TABLE IF EXISTS public.documents;
DROP TABLE IF EXISTS public.document_workflows;
DROP TABLE IF EXISTS public.document_versions;
DROP TABLE IF EXISTS public.document_types;
DROP TABLE IF EXISTS public.document_templates;
DROP TABLE IF EXISTS public.document_files;
DROP TABLE IF EXISTS public.document_comments;
DROP TABLE IF EXISTS public.document_attachments;
DROP TABLE IF EXISTS public.certificates;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TYPE IF EXISTS public."WorkflowStatus";
DROP TYPE IF EXISTS public."VariableType";
DROP TYPE IF EXISTS public."UserStatus";
DROP TYPE IF EXISTS public."StepType";
DROP TYPE IF EXISTS public."SignatureType";
DROP TYPE IF EXISTS public."OrgType";
DROP TYPE IF EXISTS public."OrgStatus";
DROP TYPE IF EXISTS public."NotificationType";
DROP TYPE IF EXISTS public."NotificationPriority";
DROP TYPE IF EXISTS public."DocumentStatus";
DROP TYPE IF EXISTS public."Confidentiality";
DROP TYPE IF EXISTS public."CertificateStatus";
DROP TYPE IF EXISTS public."AuditStatus";
DROP TYPE IF EXISTS public."AssignmentStatus";
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AssignmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssignmentStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'REJECTED',
    'ESCALATED'
);


ALTER TYPE public."AssignmentStatus" OWNER TO postgres;

--
-- Name: AuditStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AuditStatus" AS ENUM (
    'SUCCESS',
    'FAILURE'
);


ALTER TYPE public."AuditStatus" OWNER TO postgres;

--
-- Name: CertificateStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CertificateStatus" AS ENUM (
    'ACTIVE',
    'REVOKED',
    'EXPIRED'
);


ALTER TYPE public."CertificateStatus" OWNER TO postgres;

--
-- Name: Confidentiality; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Confidentiality" AS ENUM (
    'PUBLIC',
    'RESTRICTED',
    'CONFIDENTIAL',
    'SECRET'
);


ALTER TYPE public."Confidentiality" OWNER TO postgres;

--
-- Name: DocumentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DocumentStatus" AS ENUM (
    'DRAFT',
    'REVIEW',
    'APPROVED',
    'PUBLISHED',
    'ARCHIVED',
    'REJECTED'
);


ALTER TYPE public."DocumentStatus" OWNER TO postgres;

--
-- Name: NotificationPriority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT',
    'CRITICAL'
);


ALTER TYPE public."NotificationPriority" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'DOCUMENT_CREATED',
    'DOCUMENT_UPDATED',
    'DOCUMENT_DELETED',
    'DOCUMENT_SHARED',
    'TEMPLATE_CREATED',
    'TEMPLATE_UPDATED',
    'WORKFLOW_UPDATED',
    'SYSTEM_ALERT',
    'USER_MENTION',
    'TASK_ASSIGNED'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: OrgStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrgStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."OrgStatus" OWNER TO postgres;

--
-- Name: OrgType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrgType" AS ENUM (
    'MINISTRY',
    'PARLIAMENT',
    'COUNCIL',
    'COURT',
    'OTHER'
);


ALTER TYPE public."OrgType" OWNER TO postgres;

--
-- Name: SignatureType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SignatureType" AS ENUM (
    'ELECTRONIC',
    'DIGITAL',
    'QUALIFIED'
);


ALTER TYPE public."SignatureType" OWNER TO postgres;

--
-- Name: StepType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StepType" AS ENUM (
    'VALIDATION',
    'EDITION',
    'REVIEW',
    'SIGNATURE',
    'NOTIFICATION',
    'PUBLICATION'
);


ALTER TYPE public."StepType" OWNER TO postgres;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'PENDING'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

--
-- Name: VariableType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VariableType" AS ENUM (
    'TEXT',
    'TEXTAREA',
    'NUMBER',
    'DATE',
    'BOOLEAN',
    'SELECT',
    'MULTISELECT'
);


ALTER TYPE public."VariableType" OWNER TO postgres;

--
-- Name: WorkflowStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WorkflowStatus" AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'SUSPENDED',
    'TERMINATED'
);


ALTER TYPE public."WorkflowStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "eventType" text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    "userId" text NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    action text NOT NULL,
    details jsonb,
    status public."AuditStatus" NOT NULL,
    "errorMessage" text
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: certificates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certificates (
    id text NOT NULL,
    "userId" text NOT NULL,
    issuer text NOT NULL,
    "serialNumber" text NOT NULL,
    "validFrom" timestamp(3) without time zone NOT NULL,
    "validTo" timestamp(3) without time zone NOT NULL,
    "publicKey" text NOT NULL,
    status public."CertificateStatus" DEFAULT 'ACTIVE'::public."CertificateStatus" NOT NULL,
    "revocationDate" timestamp(3) without time zone,
    "revocationReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.certificates OWNER TO postgres;

--
-- Name: document_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_attachments (
    id text NOT NULL,
    "documentId" text NOT NULL,
    name text NOT NULL,
    "filePath" text NOT NULL,
    "fileType" text NOT NULL,
    "fileSize" integer NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "uploadedById" text NOT NULL,
    description text,
    "isDeleted" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.document_attachments OWNER TO postgres;

--
-- Name: document_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_comments (
    id text NOT NULL,
    "documentId" text NOT NULL,
    "versionId" text,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdById" text NOT NULL,
    "parentCommentId" text,
    "isResolved" boolean DEFAULT false NOT NULL,
    "resolvedAt" timestamp(3) without time zone,
    "resolvedById" text
);


ALTER TABLE public.document_comments OWNER TO postgres;

--
-- Name: document_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_files (
    id text NOT NULL,
    "documentVersionId" text NOT NULL,
    format text NOT NULL,
    "filePath" text NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    metadata jsonb
);


ALTER TABLE public.document_files OWNER TO postgres;

--
-- Name: document_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_templates (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "documentTypeId" text NOT NULL,
    content text NOT NULL,
    format text DEFAULT 'markdown'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdById" text NOT NULL,
    "updatedById" text NOT NULL
);


ALTER TABLE public.document_templates OWNER TO postgres;

--
-- Name: document_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_types (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "workflowId" text NOT NULL,
    "templateId" text,
    "metadataSchema" jsonb,
    "retentionPeriod" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.document_types OWNER TO postgres;

--
-- Name: document_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_versions (
    id text NOT NULL,
    "documentId" text NOT NULL,
    "versionNumber" integer NOT NULL,
    content text,
    "contentFormat" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdById" text NOT NULL,
    "changeSummary" text,
    status text NOT NULL,
    "isMajorVersion" boolean DEFAULT false NOT NULL,
    checksum text,
    "originalFilePath" text,
    "originalFileType" text,
    "originalFileSize" integer,
    "storageLocation" text,
    "hasTextExtracted" boolean DEFAULT false NOT NULL,
    "availableFormats" text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public.document_versions OWNER TO postgres;

--
-- Name: document_workflows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_workflows (
    id text NOT NULL,
    "documentId" text NOT NULL,
    "workflowId" text NOT NULL,
    "currentStepId" text NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "startedById" text NOT NULL,
    status public."WorkflowStatus" DEFAULT 'ACTIVE'::public."WorkflowStatus" NOT NULL
);


ALTER TABLE public.document_workflows OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id text NOT NULL,
    title text NOT NULL,
    "referenceNumber" text NOT NULL,
    "documentTypeId" text NOT NULL,
    status public."DocumentStatus" DEFAULT 'DRAFT'::public."DocumentStatus" NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "currentWorkflowStepId" text,
    language text NOT NULL,
    "createdById" text NOT NULL,
    "ownerOrganizationId" text NOT NULL,
    confidentiality public."Confidentiality" DEFAULT 'PUBLIC'::public."Confidentiality" NOT NULL,
    "creationDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastModifiedDate" timestamp(3) without time zone NOT NULL,
    "lastModifiedById" text NOT NULL,
    "isTemplate" boolean DEFAULT false NOT NULL,
    "parentDocumentId" text,
    "publicationDate" timestamp(3) without time zone,
    "effectiveDate" timestamp(3) without time zone,
    "expirationDate" timestamp(3) without time zone,
    keywords text[],
    metadata jsonb,
    "primaryFormat" text,
    "fileCount" integer DEFAULT 0 NOT NULL,
    "totalSize" integer DEFAULT 0 NOT NULL,
    "textExtracted" boolean DEFAULT false NOT NULL,
    "availableFormats" text[] DEFAULT ARRAY[]::text[],
    "lastSearchIndexed" timestamp(3) without time zone
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_preferences (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "documentUpdates" boolean DEFAULT true NOT NULL,
    "workflowUpdates" boolean DEFAULT true NOT NULL,
    "templateUpdates" boolean DEFAULT true NOT NULL,
    "systemNotifications" boolean DEFAULT true NOT NULL,
    "emailNotifications" boolean DEFAULT true NOT NULL,
    "browserNotifications" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.notification_preferences OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type public."NotificationType" NOT NULL,
    priority public."NotificationPriority" DEFAULT 'MEDIUM'::public."NotificationPriority" NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "actionUrl" text,
    "actionLabel" text,
    "userId" text NOT NULL,
    "entityType" text,
    "entityId" text,
    metadata jsonb
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: organization_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization_users (
    "organizationId" text NOT NULL,
    "userId" text NOT NULL,
    "position" text,
    "isAdmin" boolean DEFAULT false NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "validFrom" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "validTo" timestamp(3) without time zone
);


ALTER TABLE public.organization_users OWNER TO postgres;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "orgType" public."OrgType" NOT NULL,
    "parentId" text,
    status public."OrgStatus" DEFAULT 'ACTIVE'::public."OrgStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    code text NOT NULL,
    description text,
    "resourceType" text NOT NULL,
    action text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "assignedBy" text NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: signatures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.signatures (
    id text NOT NULL,
    "documentId" text NOT NULL,
    "versionId" text NOT NULL,
    "signedById" text NOT NULL,
    "signedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "signatureType" public."SignatureType" NOT NULL,
    "signatureValue" text NOT NULL,
    "certificateId" text,
    "signaturePosition" jsonb,
    "isValid" boolean DEFAULT true NOT NULL,
    "validationDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reason text,
    "ipAddress" text,
    metadata jsonb
);


ALTER TABLE public.signatures OWNER TO postgres;

--
-- Name: step_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.step_assignments (
    id text NOT NULL,
    "documentWorkflowId" text NOT NULL,
    "stepId" text NOT NULL,
    "assignedToId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "assignedById" text NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    status public."AssignmentStatus" DEFAULT 'PENDING'::public."AssignmentStatus" NOT NULL,
    comment text
);


ALTER TABLE public.step_assignments OWNER TO postgres;

--
-- Name: step_histories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.step_histories (
    id text NOT NULL,
    "documentWorkflowId" text NOT NULL,
    "stepId" text NOT NULL,
    action text NOT NULL,
    "actionById" text NOT NULL,
    "actionAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "fromStatus" text NOT NULL,
    "toStatus" text NOT NULL,
    comment text,
    metadata jsonb
);


ALTER TABLE public.step_histories OWNER TO postgres;

--
-- Name: system_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "notificationType" text NOT NULL,
    "relatedEntityType" text,
    "relatedEntityId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "expirationDate" timestamp(3) without time zone,
    priority public."NotificationPriority" DEFAULT 'MEDIUM'::public."NotificationPriority" NOT NULL
);


ALTER TABLE public.system_notifications OWNER TO postgres;

--
-- Name: template_variables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_variables (
    id text NOT NULL,
    "templateId" text NOT NULL,
    key text NOT NULL,
    label text NOT NULL,
    description text,
    "variableType" public."VariableType" DEFAULT 'TEXT'::public."VariableType" NOT NULL,
    "isRequired" boolean DEFAULT false NOT NULL,
    "defaultValue" text,
    "validationRules" jsonb,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.template_variables OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    "userId" text NOT NULL,
    "roleId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "assignedBy" text NOT NULL,
    "validFrom" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "validTo" timestamp(3) without time zone
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "firstName" text,
    "lastName" text,
    status public."UserStatus" DEFAULT 'PENDING'::public."UserStatus" NOT NULL,
    "phoneNumber" text,
    "lastLogin" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdById" text,
    "updatedById" text,
    "mfaBackupCodes" jsonb,
    "mfaEnabled" boolean DEFAULT false NOT NULL,
    "mfaSecret" text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: workflow_steps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_steps (
    id text NOT NULL,
    "workflowId" text NOT NULL,
    name text NOT NULL,
    description text,
    "stepOrder" integer NOT NULL,
    "stepType" public."StepType" NOT NULL,
    "expectedDuration" integer,
    "isMandatory" boolean DEFAULT true NOT NULL,
    "requiredRoleId" text,
    "requiresSignature" boolean DEFAULT false NOT NULL,
    "requiresComment" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.workflow_steps OWNER TO postgres;

--
-- Name: workflow_transitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_transitions (
    id text NOT NULL,
    "workflowId" text NOT NULL,
    "fromStepId" text NOT NULL,
    "toStepId" text NOT NULL,
    "transitionCondition" text,
    "isAutomatic" boolean DEFAULT false NOT NULL,
    "triggerEvent" text
);


ALTER TABLE public.workflow_transitions OWNER TO postgres;

--
-- Name: workflows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflows (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdById" text NOT NULL,
    "updatedById" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "expectedDuration" integer
);


ALTER TABLE public.workflows OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
d13ba2ee-ad86-46a2-879c-1cd4e9b6b338	9992d511accdad2dd4fd134e59e8b5ea34101e7d7a42d6e51006a69e6b2dfc37	2025-07-02 18:51:24.028105+00	20250531051046_document_file_storage	\N	\N	2025-07-02 18:51:23.778509+00	1
8ce129c5-f041-40b8-8a12-fcccd33f2fdc	4e3a9b13194cd1aa3ce872ac1f06dc972fa7a8dc8b8a3b6e0ebae6649a7e054f	2025-07-02 18:51:24.083547+00	20250627151518_add_mfa_and_templates	\N	\N	2025-07-02 18:51:24.029963+00	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, "eventType", "entityType", "entityId", "userId", "timestamp", "ipAddress", "userAgent", action, details, status, "errorMessage") FROM stdin;
\.


--
-- Data for Name: certificates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.certificates (id, "userId", issuer, "serialNumber", "validFrom", "validTo", "publicKey", status, "revocationDate", "revocationReason", "createdAt") FROM stdin;
\.


--
-- Data for Name: document_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_attachments (id, "documentId", name, "filePath", "fileType", "fileSize", "uploadedAt", "uploadedById", description, "isDeleted") FROM stdin;
\.


--
-- Data for Name: document_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_comments (id, "documentId", "versionId", content, "createdAt", "createdById", "parentCommentId", "isResolved", "resolvedAt", "resolvedById") FROM stdin;
\.


--
-- Data for Name: document_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_files (id, "documentVersionId", format, "filePath", "fileSize", "mimeType", "createdAt", "updatedAt", "isActive", metadata) FROM stdin;
\.


--
-- Data for Name: document_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_templates (id, name, description, "documentTypeId", content, format, "isActive", version, metadata, "createdAt", "updatedAt", "createdById", "updatedById") FROM stdin;
\.


--
-- Data for Name: document_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_types (id, name, description, "workflowId", "templateId", "metadataSchema", "retentionPeriod", "createdAt", "updatedAt") FROM stdin;
c42c133a-9ffc-4457-bfc1-70444b0cfa79	Amendment	Proposed changes to existing legislation	da6d3147-3b87-4bad-8e70-ad0379bd696e	\N	\N	\N	2025-07-02 18:56:37.857	2025-07-02 18:56:37.857
810ebed1-0167-41ba-bb2f-dbb8ed67ded1	Report	Detailed analysis or findings	da6d3147-3b87-4bad-8e70-ad0379bd696e	\N	\N	\N	2025-07-02 18:56:37.857	2025-07-02 18:56:37.857
dba44781-703d-482e-8da1-dc766b209bc4	Policy Brief	Brief summary of policy implications	da6d3147-3b87-4bad-8e70-ad0379bd696e	\N	\N	\N	2025-07-02 18:56:37.857	2025-07-02 18:56:37.857
1dd41f8d-dd9f-4c32-ab50-c39b5ecb2182	Legislation Draft	Initial draft of legislative document	da6d3147-3b87-4bad-8e70-ad0379bd696e	\N	\N	\N	2025-07-02 18:56:37.857	2025-07-02 18:56:37.857
3b48e49b-94f6-4129-8ad0-ce4cb4da3e32	Legal Opinion	Expert legal analysis and opinion	da6d3147-3b87-4bad-8e70-ad0379bd696e	\N	\N	\N	2025-07-02 18:56:37.857	2025-07-02 18:56:37.857
\.


--
-- Data for Name: document_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_versions (id, "documentId", "versionNumber", content, "contentFormat", "createdAt", "createdById", "changeSummary", status, "isMajorVersion", checksum, "originalFilePath", "originalFileType", "originalFileSize", "storageLocation", "hasTextExtracted", "availableFormats") FROM stdin;
bea26456-e436-48d1-9a45-febcee139e84	388258e0-811b-433e-91d2-15ac09f4a7f4	1	# Final Test 1751489796089\n\n## Document Content\n\nThis document is ready for editing. Please add your content here.\n\n### Key Points\n- Add main points here\n- Include relevant information\n- Structure your content clearly\n\n---\n*Document created: 7/2/2025*	markdown	2025-07-02 21:00:18.481	user-001	Initial document content created	ACTIVE	t	\N	\N	\N	\N	\N	f	{}
faab8a9b-eee7-4d5e-ab2a-0e15fb0bcf4c	388258e0-811b-433e-91d2-15ac09f4a7f4	2	# Final Test 1751489796089 - REAL CONTENT TEST\n\n## This is Real Database Content\n\n**Test timestamp:** 2025-07-02T21:00:18.491Z\n\n### Content Features\n- This content is stored in the DocumentVersion table\n- Each save creates a new version\n- Content persists across page reloads\n- No more mock environmental legislation!\n\n### Test Data\n- Document ID: 388258e0-811b-433e-91d2-15ac09f4a7f4\n- Saved at: 7/2/2025, 10:00:18 PM\n- Content type: Real database storage\n\n---\n*This proves the content system is working with real data!*	markdown	2025-07-02 21:00:18.538	user-001	Testing real content storage	ACTIVE	f	\N	\N	\N	\N	\N	f	{}
106aea13-00e1-4cf6-92bf-a953e32b97fa	8caa6c8b-f121-41e5-8b99-3675e6c5463a	1	# Policy Brief Template\n\n## Document Content\n\nThis document is ready for editing. Please add your content here.\n\n### Key Points\n- Add main points here\n- Include relevant information\n- Structure your content clearly\n\n---\n*Document created: 7/2/2025*	markdown	2025-07-02 21:00:19.089	user-001	Initial document content created	ACTIVE	t	\N	\N	\N	\N	\N	f	{}
e1c95156-e618-4027-a70d-c11a430bca87	027f8391-7d37-4037-b80d-baf5c2a93230	1	# Sample Legislation Draft\n\n## Document Overview\n\nThis is a real document in the LEGIS-FLOW system with proper database storage.\n\n### Key Information\n- Document stored in PostgreSQL database\n- Content versioning enabled\n- Full edit history maintained\n- Real-time collaborative editing supported\n\n### Document Structure\n1. **Introduction**\n   - Purpose and scope of this document\n   - Relevant legal framework\n\n2. **Main Content**\n   - Detailed provisions and requirements\n   - Implementation guidelines\n\n3. **Conclusion**\n   - Summary of key points\n   - Next steps and timeline\n\n---\n*Document created: 7/2/2025 | System: LEGIS-FLOW*	markdown	2025-07-02 21:01:03.39	user-001	Initial document content populated	ACTIVE	t	\N	\N	\N	\N	\N	f	{}
b82a020b-5bff-47ed-abc4-9071e31552fc	6ee4766a-695f-4188-9027-2c190e83371b	1	# Sample Policy Brief\n\n## Document Overview\n\nThis is a real document in the LEGIS-FLOW system with proper database storage.\n\n### Key Information\n- Document stored in PostgreSQL database\n- Content versioning enabled\n- Full edit history maintained\n- Real-time collaborative editing supported\n\n### Document Structure\n1. **Introduction**\n   - Purpose and scope of this document\n   - Relevant legal framework\n\n2. **Main Content**\n   - Detailed provisions and requirements\n   - Implementation guidelines\n\n3. **Conclusion**\n   - Summary of key points\n   - Next steps and timeline\n\n---\n*Document created: 7/2/2025 | System: LEGIS-FLOW*	markdown	2025-07-02 21:01:03.398	user-001	Initial document content populated	ACTIVE	t	\N	\N	\N	\N	\N	f	{}
32469e55-2a94-47bf-a999-26d0509ea58e	388258e0-811b-433e-91d2-15ac09f4a7f4	3	# Final Test 1751489796089 - REAL CONTENT TEST\n\n## This is Real Database Content\n\n**Test timestamp:** 2025-07-02T21:00:18.491Z\n\n### Content Features\n- This content is stored in the DocumentVersion table\n- Each save creates a new version\n- Content persists across page reloads\n- No more mock environmental legislation!\n\n### Test Data\n- Document ID: 388258e0-811b-433e-91d2-15ac09f4a7f4\n- Saved at: 7/2/2025, 10:00:18 PM\n- Content type: Real database storage\n\n---\n*This proves the content system is working with real data!*\n1212126	markdown	2025-07-02 21:08:20.691	user-001	Content updated via API	ACTIVE	f	\N	\N	\N	\N	\N	f	{}
61734da6-3fee-4e28-8a30-fcf279a82860	388258e0-811b-433e-91d2-15ac09f4a7f4	4	# Final Test 1751489796089 - REAL CONTENT TEST\n\n## This is Real Database Content\n\n**Test timestamp:** 2025-07-02T21:00:18.491Z\n\n### Content Features\n- This content is stored in the DocumentVersion table\n- Each save creates a new version\n- Content persists across page reloads\n- No more mock environmental legislation!\n\n### Test Data\n- Document ID: 388258e0-811b-433e-91d2-15ac09f4a7f4\n- Saved at: 7/2/2025, 10:00:18 PM\n- Content type: Real database storage\n\n---\n*This proves the content system is working with real data!*\n1212126	markdown	2025-07-02 21:08:39.027	user-001	Content updated via API	ACTIVE	f	\N	\N	\N	\N	\N	f	{}
168bf308-78ac-42f3-9ce3-7d495adc53f9	388258e0-811b-433e-91d2-15ac09f4a7f4	5	# Final Test\n\n1212126	markdown	2025-07-02 21:08:45.994	user-001	Content updated via API	ACTIVE	f	\N	\N	\N	\N	\N	f	{}
\.


--
-- Data for Name: document_workflows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_workflows (id, "documentId", "workflowId", "currentStepId", "startedAt", "updatedAt", "completedAt", "startedById", status) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, title, "referenceNumber", "documentTypeId", status, version, "currentWorkflowStepId", language, "createdById", "ownerOrganizationId", confidentiality, "creationDate", "lastModifiedDate", "lastModifiedById", "isTemplate", "parentDocumentId", "publicationDate", "effectiveDate", "expirationDate", keywords, metadata, "primaryFormat", "fileCount", "totalSize", "textExtracted", "availableFormats", "lastSearchIndexed") FROM stdin;
027f8391-7d37-4037-b80d-baf5c2a93230	Sample Legislation Draft	DOC-2023-001	1dd41f8d-dd9f-4c32-ab50-c39b5ecb2182	DRAFT	1	\N	en	user-001	org-001	PUBLIC	2025-07-02 18:56:37.904	2025-07-02 18:56:37.904	user-001	f	\N	\N	\N	\N	{sample,legislation,draft}	{"tags": ["example", "seed-data"], "category": "LEGISLATIVE"}	docx	0	0	f	{}	\N
6ee4766a-695f-4188-9027-2c190e83371b	Sample Policy Brief	DOC-2023-002	dba44781-703d-482e-8da1-dc766b209bc4	DRAFT	1	\N	en	user-001	org-001	RESTRICTED	2025-07-02 18:56:37.904	2025-07-02 18:56:37.904	user-001	f	\N	\N	\N	\N	{policy,brief,analysis}	{"tags": ["example", "seed-data"], "category": "POLICY"}	pdf	0	0	f	{}	\N
8caa6c8b-f121-41e5-8b99-3675e6c5463a	Policy Brief Template	TPL-2024-002	dba44781-703d-482e-8da1-dc766b209bc4	DRAFT	1	\N	en	user-001	org-001	PUBLIC	2025-07-02 18:56:37.912	2025-07-02 18:56:37.912	user-001	t	\N	\N	\N	\N	{template,policy,brief}	{"tags": ["template", "brief"], "content": "# {{policy_title}}\\n\\n## Executive Summary\\n{{executive_summary}}\\n\\n## Problem Statement\\n{{problem_statement}}\\n\\n## Recommendations\\n{{recommendations}}\\n\\n## Conclusion\\n{{conclusion}}", "category": "POLICY", "variables": [{"name": "policy_title", "type": "text", "label": "Policy Title", "required": true}, {"name": "executive_summary", "type": "textarea", "label": "Executive Summary", "required": true}, {"name": "problem_statement", "type": "textarea", "label": "Problem Statement", "required": true}, {"name": "recommendations", "type": "textarea", "label": "Recommendations", "required": true}, {"name": "conclusion", "type": "textarea", "label": "Conclusion", "required": false}], "description": "Template for policy brief documents"}	markdown	0	0	f	{}	\N
388258e0-811b-433e-91d2-15ac09f4a7f4	Final Test 1751489796089	TPL-2024-001	1dd41f8d-dd9f-4c32-ab50-c39b5ecb2182	APPROVED	1	\N	en	user-001	org-001	RESTRICTED	2025-07-02 18:56:37.912	2025-07-02 21:08:45.948	user-001	t	\N	\N	\N	\N	{final,test,correct}	{"tags": ["template", "standard"], "content": "# {{title}}\\n\\n## Article 1\\n{{article_1_content}}\\n\\n## Article 2\\n{{article_2_content}}\\n\\n---\\n*Document created on {{date}}*", "category": "LEGISLATIVE", "variables": [{"name": "title", "type": "text", "label": "Document Title", "required": true}, {"name": "article_1_content", "type": "textarea", "label": "Article 1 Content", "required": true}, {"name": "article_2_content", "type": "textarea", "label": "Article 2 Content", "required": false}], "description": "Final Description 1751489796089"}	markdown	0	0	f	{}	\N
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_preferences (id, "createdAt", "updatedAt", "userId", "documentUpdates", "workflowUpdates", "templateUpdates", "systemNotifications", "emailNotifications", "browserNotifications") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, "createdAt", "updatedAt", title, message, type, priority, "isRead", "readAt", "actionUrl", "actionLabel", "userId", "entityType", "entityId", metadata) FROM stdin;
\.


--
-- Data for Name: organization_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organization_users ("organizationId", "userId", "position", "isAdmin", "assignedAt", "validFrom", "validTo") FROM stdin;
org-001	91e4c9fd-95bc-4ce6-8618-086975d79266	Member	f	2025-07-02 20:16:28.665	2025-07-02 20:16:28.665	\N
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizations (id, name, description, "orgType", "parentId", status, "createdAt", "updatedAt") FROM stdin;
org-001	Demo Organization	Organization for demonstration purposes	OTHER	\N	ACTIVE	2025-07-02 18:51:33.194	2025-07-02 18:51:33.194
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, code, description, "resourceType", action, "createdAt", "updatedAt") FROM stdin;
f4c30c54-60cc-43b0-8a39-0f948c00105e	admin.access	Access admin panel	system	read	2025-07-02 19:51:49.314	2025-07-02 19:51:49.314
54c0d4a5-8251-49c0-800f-410741ff3e4f	admin.users	Manage users	users	all	2025-07-02 19:51:49.33	2025-07-02 19:51:49.33
d749c5ed-7e13-45cb-a05d-1deb5b38e4cc	admin.roles	Manage roles	roles	all	2025-07-02 19:51:49.341	2025-07-02 19:51:49.341
a7191574-5a92-45d4-9f45-73a034df182f	admin.system	System administration	system	all	2025-07-02 19:51:49.356	2025-07-02 19:51:49.356
5ee518b6-5679-4b2a-a6c2-04ed27da2528	documents.read	Read documents	documents	read	2025-07-02 20:13:17.371	2025-07-02 20:13:17.371
35fd9e75-6f42-433d-8501-3e2e671344c2	documents.write	Create and edit documents	documents	write	2025-07-02 20:13:17.377	2025-07-02 20:13:17.377
c23750e6-3c44-454e-bd8f-7c4f60c3150c	documents.delete	Delete documents	documents	delete	2025-07-02 20:13:17.383	2025-07-02 20:13:17.383
8c0a72a7-b878-4b70-b422-a1792086f4eb	workflows.read	View workflows	workflows	read	2025-07-02 20:13:17.389	2025-07-02 20:13:17.389
acf848d0-aedb-4bbe-a61e-73f1beb990cc	workflows.write	Manage workflows	workflows	write	2025-07-02 20:13:17.395	2025-07-02 20:13:17.395
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions ("roleId", "permissionId", "assignedAt", "assignedBy") FROM stdin;
a72e3437-a64a-412d-893a-d00962199d3e	f4c30c54-60cc-43b0-8a39-0f948c00105e	2025-07-02 19:51:49.321	user-001
a72e3437-a64a-412d-893a-d00962199d3e	54c0d4a5-8251-49c0-800f-410741ff3e4f	2025-07-02 19:51:49.335	user-001
a72e3437-a64a-412d-893a-d00962199d3e	d749c5ed-7e13-45cb-a05d-1deb5b38e4cc	2025-07-02 19:51:49.348	user-001
a72e3437-a64a-412d-893a-d00962199d3e	a7191574-5a92-45d4-9f45-73a034df182f	2025-07-02 19:51:49.363	user-001
a72e3437-a64a-412d-893a-d00962199d3e	5ee518b6-5679-4b2a-a6c2-04ed27da2528	2025-07-02 20:13:17.421	system
a72e3437-a64a-412d-893a-d00962199d3e	35fd9e75-6f42-433d-8501-3e2e671344c2	2025-07-02 20:13:17.429	system
a72e3437-a64a-412d-893a-d00962199d3e	c23750e6-3c44-454e-bd8f-7c4f60c3150c	2025-07-02 20:13:17.437	system
a72e3437-a64a-412d-893a-d00962199d3e	8c0a72a7-b878-4b70-b422-a1792086f4eb	2025-07-02 20:13:17.445	system
a72e3437-a64a-412d-893a-d00962199d3e	acf848d0-aedb-4bbe-a61e-73f1beb990cc	2025-07-02 20:13:17.453	system
ee9a276b-27d1-4365-aabc-e071793175fb	5ee518b6-5679-4b2a-a6c2-04ed27da2528	2025-07-02 20:13:17.464	system
ee9a276b-27d1-4365-aabc-e071793175fb	35fd9e75-6f42-433d-8501-3e2e671344c2	2025-07-02 20:13:17.472	system
ee9a276b-27d1-4365-aabc-e071793175fb	c23750e6-3c44-454e-bd8f-7c4f60c3150c	2025-07-02 20:13:17.48	system
ee9a276b-27d1-4365-aabc-e071793175fb	8c0a72a7-b878-4b70-b422-a1792086f4eb	2025-07-02 20:13:17.487	system
ee9a276b-27d1-4365-aabc-e071793175fb	acf848d0-aedb-4bbe-a61e-73f1beb990cc	2025-07-02 20:13:17.495	system
9b20015a-f968-433c-9433-3b3ef52884eb	5ee518b6-5679-4b2a-a6c2-04ed27da2528	2025-07-02 20:13:17.505	system
9b20015a-f968-433c-9433-3b3ef52884eb	35fd9e75-6f42-433d-8501-3e2e671344c2	2025-07-02 20:13:17.513	system
9b20015a-f968-433c-9433-3b3ef52884eb	8c0a72a7-b878-4b70-b422-a1792086f4eb	2025-07-02 20:13:17.521	system
74a531e6-3dc3-45f4-bdb7-8ddfa01015e4	5ee518b6-5679-4b2a-a6c2-04ed27da2528	2025-07-02 20:13:17.531	system
74a531e6-3dc3-45f4-bdb7-8ddfa01015e4	8c0a72a7-b878-4b70-b422-a1792086f4eb	2025-07-02 20:13:17.542	system
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, "createdAt", "updatedAt") FROM stdin;
a72e3437-a64a-412d-893a-d00962199d3e	admin	Full system administrator access	2025-07-02 19:51:49.291	2025-07-02 19:51:49.291
9b20015a-f968-433c-9433-3b3ef52884eb	user	Regular user with basic document access	2025-07-02 20:13:17.336	2025-07-02 20:13:17.336
ee9a276b-27d1-4365-aabc-e071793175fb	manager	Manager with extended permissions	2025-07-02 20:13:17.345	2025-07-02 20:13:17.345
74a531e6-3dc3-45f4-bdb7-8ddfa01015e4	viewer	Read-only access to documents	2025-07-02 20:13:17.352	2025-07-02 20:13:17.352
\.


--
-- Data for Name: signatures; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.signatures (id, "documentId", "versionId", "signedById", "signedAt", "signatureType", "signatureValue", "certificateId", "signaturePosition", "isValid", "validationDate", reason, "ipAddress", metadata) FROM stdin;
\.


--
-- Data for Name: step_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.step_assignments (id, "documentWorkflowId", "stepId", "assignedToId", "assignedAt", "assignedById", "dueDate", "completedAt", status, comment) FROM stdin;
\.


--
-- Data for Name: step_histories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.step_histories (id, "documentWorkflowId", "stepId", action, "actionById", "actionAt", "fromStatus", "toStatus", comment, metadata) FROM stdin;
\.


--
-- Data for Name: system_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_notifications (id, "userId", title, message, "notificationType", "relatedEntityType", "relatedEntityId", "createdAt", "isRead", "readAt", "expirationDate", priority) FROM stdin;
\.


--
-- Data for Name: template_variables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.template_variables (id, "templateId", key, label, description, "variableType", "isRequired", "defaultValue", "validationRules", "displayOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles ("userId", "roleId", "assignedAt", "assignedBy", "validFrom", "validTo") FROM stdin;
user-001	a72e3437-a64a-412d-893a-d00962199d3e	2025-07-02 19:51:49.304	user-001	2025-07-02 19:51:49.304	\N
204a266f-ae54-4478-ab93-2eeec681b4e6	9b20015a-f968-433c-9433-3b3ef52884eb	2025-07-02 20:13:17.556	system	2025-07-02 20:13:17.556	\N
de64350c-72b7-497d-8be2-96fb237518a3	9b20015a-f968-433c-9433-3b3ef52884eb	2025-07-02 20:13:54.956	user-001	2025-07-02 20:13:54.956	\N
91e4c9fd-95bc-4ce6-8618-086975d79266	74a531e6-3dc3-45f4-bdb7-8ddfa01015e4	2025-07-02 20:16:28.658	user-001	2025-07-02 20:16:28.658	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, "passwordHash", "firstName", "lastName", status, "phoneNumber", "lastLogin", "createdAt", "updatedAt", "createdById", "updatedById", "mfaBackupCodes", "mfaEnabled", "mfaSecret") FROM stdin;
204a266f-ae54-4478-ab93-2eeec681b4e6	y.jebbar75	y.jebbar75@gmail.com	$2b$10$63pbPQVLvjMoPXwIXb/S/./zllm9vLrAY.OHmfoykEPSsq0ENEL2q	yasser	jebbar	ACTIVE	\N	\N	2025-07-02 18:53:13.094	2025-07-02 18:53:13.094	\N	\N	\N	f	\N
user-001	admin	admin@example.com	$2b$12$yDaFNdVo5RVI0F2kzm199et.MywyIgyVdCI5ltSmvjVR2NtTTa8m2	Admin	User	ACTIVE	\N	\N	2025-07-02 18:51:33.185	2025-07-02 20:00:32.625	\N	\N	\N	f	\N
de64350c-72b7-497d-8be2-96fb237518a3	testuser	test@legisflow.com	$2b$12$M5gYKXQvNroiR3n9kdN92Om4HJyoGt2RmB8td.RjUizVycRlYZbPa	Test	User	SUSPENDED	\N	\N	2025-07-02 20:13:54.948	2025-07-02 20:13:56.647	\N	\N	\N	f	\N
91e4c9fd-95bc-4ce6-8618-086975d79266	etytt	test@test.test	$2b$12$xJEfZsbOlxCi62B0lS3mk.UkzFuzWa2PvrFHht0uOCXmdgJOWxdPm	test	test	ACTIVE	\N	\N	2025-07-02 20:16:28.65	2025-07-02 20:16:28.65	\N	\N	\N	f	\N
\.


--
-- Data for Name: workflow_steps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_steps (id, "workflowId", name, description, "stepOrder", "stepType", "expectedDuration", "isMandatory", "requiredRoleId", "requiresSignature", "requiresComment") FROM stdin;
76d25ad2-4c17-4baf-9858-c6ef336b3b3e	c0eb1574-c18c-44f1-b392-4d4b108a9bfe	Draft Creation	Initial document creation and drafting	1	EDITION	2	t	\N	f	f
62174b03-1adc-47da-a6f4-3df6fe4941b2	c0eb1574-c18c-44f1-b392-4d4b108a9bfe	Review	Content review and validation	2	REVIEW	2	t	\N	f	f
73100b25-c2b2-413f-a32b-1b3b1889a4a0	c0eb1574-c18c-44f1-b392-4d4b108a9bfe	Legal Validation	Legal compliance verification	3	VALIDATION	2	t	\N	f	f
62dbe76d-e30f-44c3-a50c-243c231fa8a0	c0eb1574-c18c-44f1-b392-4d4b108a9bfe	Approval	Final approval and authorization	4	SIGNATURE	2	t	\N	f	f
05824619-d514-4721-8d1d-f65c71c60f18	c0eb1574-c18c-44f1-b392-4d4b108a9bfe	Publication	Document publication and distribution	5	PUBLICATION	2	t	\N	f	f
45fc4e6d-6556-47a5-ab10-ee45312fdb18	83a54e9e-5481-40d7-98d6-1ed6a4ef9788	Draft Creation	Initial document creation and drafting	1	EDITION	2	t	\N	f	f
6d166a76-2324-4a13-914b-f93b1c57e9ff	83a54e9e-5481-40d7-98d6-1ed6a4ef9788	Review	Content review and validation	2	REVIEW	2	t	\N	f	f
4fbc18d4-bdfa-4d54-8dfd-a8e81843cfac	83a54e9e-5481-40d7-98d6-1ed6a4ef9788	Legal Validation	Legal compliance verification	3	VALIDATION	2	t	\N	f	f
884a32f2-22da-441f-8fd0-6f731d849952	83a54e9e-5481-40d7-98d6-1ed6a4ef9788	Approval	Final approval and authorization	4	SIGNATURE	2	t	\N	f	f
df382162-2c14-4c89-8dd9-1361f11d4f01	83a54e9e-5481-40d7-98d6-1ed6a4ef9788	Publication	Document publication and distribution	5	PUBLICATION	2	t	\N	f	f
0a977fe4-6ed2-4515-9c4a-973f475f8546	da6d3147-3b87-4bad-8e70-ad0379bd696e	Draft Creation	Initial document creation and drafting	1	EDITION	2	t	\N	f	f
f77f528e-1645-4b13-ae1b-d187093d2f9a	da6d3147-3b87-4bad-8e70-ad0379bd696e	Review	Content review and validation	2	REVIEW	2	t	\N	f	f
fe77ce91-3e71-4a79-b2ba-3ae0e609a0d4	da6d3147-3b87-4bad-8e70-ad0379bd696e	Legal Validation	Legal compliance verification	3	VALIDATION	2	t	\N	f	f
8386a35a-66b8-4612-b5d9-a0365213f0ac	da6d3147-3b87-4bad-8e70-ad0379bd696e	Approval	Final approval and authorization	4	SIGNATURE	2	t	\N	f	f
50bc1c86-e153-48ff-aa5d-4600b5233ed6	da6d3147-3b87-4bad-8e70-ad0379bd696e	Publication	Document publication and distribution	5	PUBLICATION	2	t	\N	f	f
\.


--
-- Data for Name: workflow_transitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_transitions (id, "workflowId", "fromStepId", "toStepId", "transitionCondition", "isAutomatic", "triggerEvent") FROM stdin;
\.


--
-- Data for Name: workflows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflows (id, name, description, "createdAt", "updatedAt", "createdById", "updatedById", "isActive", version, "expectedDuration") FROM stdin;
c0eb1574-c18c-44f1-b392-4d4b108a9bfe	Standard Document Workflow	Default workflow for documents	2025-07-02 18:51:33.179	2025-07-02 18:51:33.179	user-001	user-001	t	1	\N
83a54e9e-5481-40d7-98d6-1ed6a4ef9788	Standard Document Workflow	Default workflow for documents	2025-07-02 18:56:21.713	2025-07-02 18:56:21.713	user-001	user-001	t	1	\N
da6d3147-3b87-4bad-8e70-ad0379bd696e	Standard Document Workflow	Default workflow for documents	2025-07-02 18:56:37.825	2025-07-02 18:56:37.825	user-001	user-001	t	1	\N
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- Name: document_attachments document_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_attachments
    ADD CONSTRAINT document_attachments_pkey PRIMARY KEY (id);


--
-- Name: document_comments document_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_comments
    ADD CONSTRAINT document_comments_pkey PRIMARY KEY (id);


--
-- Name: document_files document_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_files
    ADD CONSTRAINT document_files_pkey PRIMARY KEY (id);


--
-- Name: document_templates document_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT document_templates_pkey PRIMARY KEY (id);


--
-- Name: document_types document_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_types
    ADD CONSTRAINT document_types_pkey PRIMARY KEY (id);


--
-- Name: document_versions document_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_pkey PRIMARY KEY (id);


--
-- Name: document_workflows document_workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_workflows
    ADD CONSTRAINT document_workflows_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: organization_users organization_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_pkey PRIMARY KEY ("organizationId", "userId");


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY ("roleId", "permissionId");


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: signatures signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_pkey PRIMARY KEY (id);


--
-- Name: step_assignments step_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.step_assignments
    ADD CONSTRAINT step_assignments_pkey PRIMARY KEY (id);


--
-- Name: step_histories step_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.step_histories
    ADD CONSTRAINT step_histories_pkey PRIMARY KEY (id);


--
-- Name: system_notifications system_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_notifications
    ADD CONSTRAINT system_notifications_pkey PRIMARY KEY (id);


--
-- Name: template_variables template_variables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_variables
    ADD CONSTRAINT template_variables_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY ("userId", "roleId");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workflow_steps workflow_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_pkey PRIMARY KEY (id);


--
-- Name: workflow_transitions workflow_transitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT workflow_transitions_pkey PRIMARY KEY (id);


--
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);


--
-- Name: document_files_documentVersionId_format_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "document_files_documentVersionId_format_key" ON public.document_files USING btree ("documentVersionId", format);


--
-- Name: document_versions_documentId_versionNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "document_versions_documentId_versionNumber_key" ON public.document_versions USING btree ("documentId", "versionNumber");


--
-- Name: document_workflows_documentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "document_workflows_documentId_key" ON public.document_workflows USING btree ("documentId");


--
-- Name: documents_referenceNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "documents_referenceNumber_key" ON public.documents USING btree ("referenceNumber");


--
-- Name: notification_preferences_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "notification_preferences_userId_key" ON public.notification_preferences USING btree ("userId");


--
-- Name: notifications_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_createdAt_idx" ON public.notifications USING btree ("createdAt");


--
-- Name: notifications_userId_isRead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_userId_isRead_idx" ON public.notifications USING btree ("userId", "isRead");


--
-- Name: permissions_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permissions_code_key ON public.permissions USING btree (code);


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: template_variables_templateId_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "template_variables_templateId_key_key" ON public.template_variables USING btree ("templateId", key);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: certificates certificates_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT "certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_attachments document_attachments_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_attachments
    ADD CONSTRAINT "document_attachments_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public.documents(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_attachments document_attachments_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_attachments
    ADD CONSTRAINT "document_attachments_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_comments document_comments_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_comments
    ADD CONSTRAINT "document_comments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_comments document_comments_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_comments
    ADD CONSTRAINT "document_comments_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public.documents(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_comments document_comments_parentCommentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_comments
    ADD CONSTRAINT "document_comments_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES public.document_comments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: document_comments document_comments_resolvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_comments
    ADD CONSTRAINT "document_comments_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: document_comments document_comments_versionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_comments
    ADD CONSTRAINT "document_comments_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES public.document_versions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: document_files document_files_documentVersionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_files
    ADD CONSTRAINT "document_files_documentVersionId_fkey" FOREIGN KEY ("documentVersionId") REFERENCES public.document_versions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_templates document_templates_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT "document_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_templates document_templates_documentTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT "document_templates_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES public.document_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_templates document_templates_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT "document_templates_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_types document_types_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_types
    ADD CONSTRAINT "document_types_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.documents(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: document_types document_types_workflowId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_types
    ADD CONSTRAINT "document_types_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES public.workflows(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_versions document_versions_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT "document_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_versions document_versions_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT "document_versions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public.documents(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_workflows document_workflows_currentStepId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_workflows
    ADD CONSTRAINT "document_workflows_currentStepId_fkey" FOREIGN KEY ("currentStepId") REFERENCES public.workflow_steps(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_workflows document_workflows_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_workflows
    ADD CONSTRAINT "document_workflows_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public.documents(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_workflows document_workflows_workflowId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_workflows
    ADD CONSTRAINT "document_workflows_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES public.workflows(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: documents documents_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: documents documents_documentTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES public.document_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: documents documents_lastModifiedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_lastModifiedById_fkey" FOREIGN KEY ("lastModifiedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: documents documents_ownerOrganizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_ownerOrganizationId_fkey" FOREIGN KEY ("ownerOrganizationId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: documents documents_parentDocumentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_parentDocumentId_fkey" FOREIGN KEY ("parentDocumentId") REFERENCES public.documents(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notification_preferences notification_preferences_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: organization_users organization_users_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT "organization_users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: organization_users organization_users_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT "organization_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: organizations organizations_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT "organizations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: signatures signatures_certificateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT "signatures_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES public.certificates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: signatures signatures_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT "signatures_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public.documents(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: signatures signatures_signedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT "signatures_signedById_fkey" FOREIGN KEY ("signedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: signatures signatures_versionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT "signatures_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES public.document_versions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: step_assignments step_assignments_assignedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.step_assignments
    ADD CONSTRAINT "step_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: step_assignments step_assignments_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.step_assignments
    ADD CONSTRAINT "step_assignments_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: step_assignments step_assignments_documentWorkflowId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.step_assignments
    ADD CONSTRAINT "step_assignments_documentWorkflowId_fkey" FOREIGN KEY ("documentWorkflowId") REFERENCES public.document_workflows(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: step_assignments step_assignments_stepId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.step_assignments
    ADD CONSTRAINT "step_assignments_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES public.workflow_steps(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: step_histories step_histories_actionById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.step_histories
    ADD CONSTRAINT "step_histories_actionById_fkey" FOREIGN KEY ("actionById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: step_histories step_histories_documentWorkflowId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.step_histories
    ADD CONSTRAINT "step_histories_documentWorkflowId_fkey" FOREIGN KEY ("documentWorkflowId") REFERENCES public.document_workflows(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: step_histories step_histories_stepId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.step_histories
    ADD CONSTRAINT "step_histories_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES public.workflow_steps(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: system_notifications system_notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_notifications
    ADD CONSTRAINT "system_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: template_variables template_variables_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_variables
    ADD CONSTRAINT "template_variables_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.document_templates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_roles user_roles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: workflow_steps workflow_steps_workflowId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT "workflow_steps_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES public.workflows(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: workflow_transitions workflow_transitions_fromStepId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT "workflow_transitions_fromStepId_fkey" FOREIGN KEY ("fromStepId") REFERENCES public.workflow_steps(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: workflow_transitions workflow_transitions_toStepId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT "workflow_transitions_toStepId_fkey" FOREIGN KEY ("toStepId") REFERENCES public.workflow_steps(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: workflow_transitions workflow_transitions_workflowId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT "workflow_transitions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES public.workflows(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

