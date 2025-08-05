import { Request, Response } from "express";
import { parameterSetService } from "./parameterset.service";
import { SaveParameterSetInput, LoadParameterSetInput, CopyParameterInput } from "./parameterset.types";

const parameterSetController = {
  async save(req: Request, res: Response) {
		try {
			
      const userId = (req as any).user?.id;
      const { name, config } = req.body;

      const saved = await parameterSetService.saveConfig({
        userId,
        name,
        config,
      });
      return res.status(201).json(saved);
    } catch (err: any) {
      console.error("Save error:", err);
      return res.status(500).json({ error: err.message });
    }
  },

  async load(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const paramSet = await parameterSetService.loadConfig({ id });
      return res.json(paramSet);
    } catch (err: any) {
      console.error("Load error:", err);
      return res.status(404).json({ error: err.message });
    }
  },

  async copyFromTraind(req: Request, res: Response) {
		try {
			
      const userId = (req as any).user?.id;
      const { traindId, name } = req.body;

      const copied = await parameterSetService.copyFromTraind(
        ({ traindId, name } as CopyParameterInput),
        userId
      );
      return res.status(201).json(copied);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
};

export default parameterSetController;
